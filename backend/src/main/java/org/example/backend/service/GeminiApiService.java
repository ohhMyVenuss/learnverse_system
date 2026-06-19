package org.example.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.quiz.QuestionDTO;
import org.example.backend.enums.DifficultyLevel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiApiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;
// bản v1 beta -> cùi mía vcl:)
//    private static final String GEMINI_API_URL =
//            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    // v1 pro-> đỡ cùi mía hơn nma chậm
//    private static final String GEMINI_API_URL =
//            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

    // Cách 3: Dùng gemini-1.5-pro-latest với v1beta
//    private static final String GEMINI_API_URL =
//            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent";


    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<QuestionDTO> generateQuizFromText(
            String documentText,
            int numberOfQuestions,
            DifficultyLevel difficultyLevel) throws Exception {

        String prompt = buildQuizPrompt(documentText, numberOfQuestions, difficultyLevel);
        String response = callGeminiApi(prompt);
        return parseQuizResponse(response);
    }

    private String buildQuizPrompt(
            String documentText,
            int numberOfQuestions,
            DifficultyLevel difficultyLevel) {

        String difficultyInstruction = switch (difficultyLevel) {
            case EASY -> "Câu hỏi ở mức độ DỄ: kiểm tra kiến thức cơ bản, ghi nhớ, định nghĩa đơn giản.";
            case MEDIUM -> "Câu hỏi ở mức độ TRUNG BÌNH: yêu cầu hiểu và áp dụng kiến thức, phân tích cơ bản.";
            case HARD -> "Câu hỏi ở mức độ KHÓ: yêu cầu phân tích sâu, tổng hợp, đánh giá và áp dụng phức tạp.";
        };

        return String.format("""
            Bạn là một giáo viên chuyên nghiệp. Hãy đọc tài liệu sau và tạo ra %d câu hỏi trắc nghiệm 
            với 4 đáp án cho mỗi câu (chỉ có 1 đáp án đúng).
            
            %s
            
            Tài liệu:
            %s
            
            Yêu cầu:
            1. Câu hỏi phải kiểm tra kiến thức quan trọng trong tài liệu
            2. Đáp án sai phải có tính hợp lý, không quá dễ đoán
            3. Độ khó của câu hỏi phải phù hợp với mức độ %s
            4. Trả về kết quả dưới dạng JSON với format:
            {
              "questions": [
                {
                  "questionText": "Nội dung câu hỏi",
                  "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
                  "correctAnswerIndex": 0,
                  "points": 10
                }
              ]
            }
            """, numberOfQuestions, difficultyInstruction, documentText, difficultyLevel.getDisplayName());
    }

    private String callGeminiApi(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(Map.of("text", prompt)));
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = GEMINI_API_URL + "?key=" + geminiApiKey;

        try {
            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();

            // Parse response từ Gemini
            if (responseBody != null && responseBody.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> candidateContent = (Map<String, Object>) candidate.get("content");
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) candidateContent.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            throw new RuntimeException("Invalid response from Gemini API");
        } catch (Exception e) {
            throw new Exception("Error calling Gemini API: " + e.getMessage(), e);
        }
    }

    private List<QuestionDTO> parseQuizResponse(String jsonResponse) throws Exception {
        try {
            // Tìm JSON trong response (có thể có text thừa)
            int jsonStart = jsonResponse.indexOf("{");
            int jsonEnd = jsonResponse.lastIndexOf("}") + 1;
            if (jsonStart == -1 || jsonEnd == 0) {
                throw new RuntimeException("No JSON found in response");
            }

            String jsonStr = jsonResponse.substring(jsonStart, jsonEnd);
            JsonNode rootNode = objectMapper.readTree(jsonStr);
            JsonNode questionsNode = rootNode.get("questions");

            if (questionsNode == null || !questionsNode.isArray()) {
                throw new RuntimeException("Invalid JSON format: missing questions array");
            }

            List<QuestionDTO> questions = new ArrayList<>();
            for (JsonNode questionNode : questionsNode) {
                String questionText = questionNode.get("questionText").asText();
                JsonNode optionsNode = questionNode.get("options");
                List<String> options = new ArrayList<>();
                for (JsonNode option : optionsNode) {
                    options.add(option.asText());
                }
                int correctAnswerIndex = questionNode.get("correctAnswerIndex").asInt();
                int points = questionNode.has("points") ? questionNode.get("points").asInt() : 10;

                questions.add(new QuestionDTO(questionText, options, correctAnswerIndex, points));
            }

            return questions;
        } catch (Exception e) {
            throw new Exception("Error parsing Gemini response: " + e.getMessage(), e);
        }
    }
}

