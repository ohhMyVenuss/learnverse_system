package org.example.backend.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class UploadService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Value("${app.upload.temp-dir:./temp-uploads}")
    private String tempUploadDir;

    // Store upload sessions in memory (có thể migrate sang Redis sau)
    private final Map<String, UploadSession> uploadSessions = new ConcurrentHashMap<>();
    // Store uploaded chunks separately (vì UploadSession là record immutable)
    private final Map<String, Map<Integer, Boolean>> uploadedChunksMap = new ConcurrentHashMap<>();

    private Cloudinary cloudinary;

    private Cloudinary getCloudinary() {
        if (cloudinary == null) {
            // Validate credentials
            if (cloudName == null || cloudName.isEmpty()) {
                throw new RuntimeException("Cloudinary cloud name is not configured");
            }
            if (apiKey == null || apiKey.isEmpty()) {
                throw new RuntimeException("Cloudinary API key is not configured. Please set CLOUDINARY_API_KEY environment variable.");
            }
            if (apiSecret == null || apiSecret.isEmpty()) {
                throw new RuntimeException("Cloudinary API secret is not configured. Please set CLOUDINARY_API_SECRET environment variable.");
            }

            Map<String, String> config = new HashMap<>();
            config.put("cloud_name", cloudName);
            config.put("api_key", apiKey);
            config.put("api_secret", apiSecret);
            cloudinary = new Cloudinary(config);
        }
        return cloudinary;
    }

    /**
     * Initialize chunked upload session
     */
    public String initChunkedUpload(String fileName, Long fileSize, String fileType, String userId) {
        String uploadId = UUID.randomUUID().toString();

        // Tạo thư mục temp cho upload này
        Path uploadPath = Paths.get(tempUploadDir, uploadId);
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directory", e);
        }

        UploadSession session = new UploadSession(
                uploadId,
                fileName,
                fileSize,
                fileType,
                userId,
                uploadPath.toString(),
                new HashMap<>(), // Placeholder, không dùng nữa
                System.currentTimeMillis()
        );

        uploadSessions.put(uploadId, session);
        uploadedChunksMap.put(uploadId, new ConcurrentHashMap<>()); // Initialize chunks map
        return uploadId;
    }

    /**
     * Upload a chunk
     */
    public boolean uploadChunk(String uploadId, Integer chunkNumber, Integer totalChunks,
                               MultipartFile chunk, String userId) throws IOException {
        UploadSession session = uploadSessions.get(uploadId);

        if (session == null) {
            throw new RuntimeException("Upload session not found: " + uploadId);
        }

        if (!session.userId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to upload session");
        }

        try {
            // Lưu chunk vào file
            Path chunkPath = Paths.get(session.tempPath(), "chunk_" + chunkNumber);
            Files.write(chunkPath, chunk.getBytes());

            // Đánh dấu chunk đã upload (sử dụng separate map)
            Map<Integer, Boolean> uploadedChunks = uploadedChunksMap.get(uploadId);
            if (uploadedChunks == null) {
                uploadedChunks = new ConcurrentHashMap<>();
                uploadedChunksMap.put(uploadId, uploadedChunks);
            }
            uploadedChunks.put(chunkNumber, true);

            System.out.println(String.format("Chunk %d/%d uploaded successfully for session %s",
                    chunkNumber, totalChunks, uploadId));

            // Kiểm tra xem đã upload hết chưa
            boolean isComplete = uploadedChunks.size() == totalChunks;

            if (isComplete) {
                System.out.println(String.format("All chunks uploaded for session %s. Ready to merge.", uploadId));
            }

            return isComplete;
        } catch (IOException e) {
            System.err.println(String.format("Failed to save chunk %d for session %s: %s",
                    chunkNumber, uploadId, e.getMessage()));
            throw new IOException("Failed to save chunk: " + e.getMessage(), e);
        }
    }

    /**
     * Complete chunked upload - Merge chunks và upload lên Cloudinary
     */
    public String completeChunkedUpload(String uploadId, String userId) throws IOException {
        UploadSession session = uploadSessions.get(uploadId);

        if (session == null) {
            throw new RuntimeException("Upload session not found: " + uploadId);
        }

        if (!session.userId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to upload session");
        }

        try {
            System.out.println(String.format("Starting merge for session %s, file: %s, size: %d bytes",
                    uploadId, session.fileName(), session.fileSize()));

            // Merge chunks
            Path mergedFile = mergeChunks(session);
            System.out.println(String.format("Merge completed for session %s. File size: %d bytes",
                    uploadId, Files.size(mergedFile)));

            // Upload lên Cloudinary
            System.out.println(String.format("Uploading to Cloudinary for session %s...", uploadId));
            String fileUrl = uploadToCloudinary(mergedFile.toFile(), session.fileType());
            System.out.println(String.format("Cloudinary upload successful for session %s. URL: %s",
                    uploadId, fileUrl));

            // Cleanup temp files
            cleanupUpload(session);

            // Remove session và chunks map
            uploadSessions.remove(uploadId);
            uploadedChunksMap.remove(uploadId);

            return fileUrl;
        } catch (Exception e) {
            System.err.println(String.format("Error completing upload for session %s: %s",
                    uploadId, e.getMessage()));
            e.printStackTrace();
            // Cleanup on error
            try {
                cleanupUpload(session);
            } catch (Exception cleanupError) {
                System.err.println("Failed to cleanup on error: " + cleanupError.getMessage());
            }
            throw new IOException("Failed to complete upload: " + e.getMessage(), e);
        }
    }

    /**
     * Merge chunks thành file hoàn chỉnh
     */
    private Path mergeChunks(UploadSession session) throws IOException {
        Path tempPath = Paths.get(session.tempPath());
        Path mergedFile = tempPath.resolve(session.fileName());

        try (FileOutputStream fos = new FileOutputStream(mergedFile.toFile())) {
            // Lấy chunks từ separate map
            Map<Integer, Boolean> uploadedChunks = uploadedChunksMap.get(session.uploadId());
            if (uploadedChunks == null || uploadedChunks.isEmpty()) {
                throw new IOException("No chunks found for session: " + session.uploadId());
            }

            // Sắp xếp chunks theo thứ tự
            List<Integer> chunkNumbers = new ArrayList<>(uploadedChunks.keySet());
            Collections.sort(chunkNumbers);

            System.out.println(String.format("Merging %d chunks for session %s",
                    chunkNumbers.size(), session.uploadId()));

            // Verify all chunks exist
            for (Integer chunkNumber : chunkNumbers) {
                Path chunkFile = tempPath.resolve("chunk_" + chunkNumber);
                if (!Files.exists(chunkFile)) {
                    throw new IOException(String.format("Chunk %d not found for session %s",
                            chunkNumber, session.uploadId()));
                }
            }

            // Merge từng chunk
            long totalBytes = 0;
            for (Integer chunkNumber : chunkNumbers) {
                Path chunkFile = tempPath.resolve("chunk_" + chunkNumber);
                long chunkSize = Files.size(chunkFile);
                Files.copy(chunkFile, fos);
                totalBytes += chunkSize;
                // Xóa chunk sau khi merge
                Files.delete(chunkFile);
                System.out.println(String.format("Merged chunk %d/%d (size: %d bytes)",
                        chunkNumber, chunkNumbers.size(), chunkSize));
            }

            System.out.println(String.format("Merge completed. Total size: %d bytes", totalBytes));
        } catch (IOException e) {
            System.err.println("Error merging chunks: " + e.getMessage());
            throw e;
        }

        return mergedFile;
    }

    /**
     * Upload file lên Cloudinary
     */
    private String uploadToCloudinary(File file, String fileType) throws IOException {
        try {
            System.out.println(String.format("Uploading file to Cloudinary: %s, size: %d bytes, type: %s",
                    file.getName(), file.length(), fileType));

            Map<String, Object> uploadParams = new HashMap<>();

            // Xác định resource type
            if (fileType.startsWith("video/")) {
                uploadParams.put("resource_type", "video");
                // Bỏ eager transformations cho video lớn để tránh timeout
                // uploadParams.put("eager", Arrays.asList("sp_full_hd", "sp_hd"));
                uploadParams.put("chunk_size", 6000000); // 6MB chunks for large videos
            } else if (fileType.startsWith("image/")) {
                uploadParams.put("resource_type", "image");
            } else {
                uploadParams.put("resource_type", "raw");
            }

            // Timeout cho video lớn
            uploadParams.put("timeout", 600000); // 10 phút

            Map<?, ?> uploadResult = getCloudinary().uploader().upload(file, uploadParams);

            String fileUrl = (String) uploadResult.get("secure_url");
            if (fileUrl == null) {
                throw new IOException("Cloudinary upload succeeded but no URL returned");
            }

            System.out.println(String.format("Cloudinary upload successful. URL: %s", fileUrl));
            return fileUrl;
        } catch (Exception e) {
            System.err.println("Cloudinary upload error: " + e.getMessage());
            e.printStackTrace();

            // Check if it's a credentials error
            if (e.getMessage() != null && e.getMessage().contains("Invalid API Key")) {
                throw new IOException("Cloudinary API Key is invalid. Please check your credentials.", e);
            }
            if (e.getMessage() != null && e.getMessage().contains("Invalid API Secret")) {
                throw new IOException("Cloudinary API Secret is invalid. Please check your credentials.", e);
            }

            throw new IOException("Failed to upload to Cloudinary: " + e.getMessage(), e);
        }
    }

    /**
     * Get upload progress
     */
    public Map<String, Object> getUploadProgress(String uploadId, String userId) {
        UploadSession session = uploadSessions.get(uploadId);

        if (session == null) {
            throw new RuntimeException("Upload session not found");
        }

        if (!session.userId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to upload session");
        }

        // Lấy chunks từ separate map
        Map<Integer, Boolean> uploadedChunks = uploadedChunksMap.get(uploadId);
        if (uploadedChunks == null) {
            uploadedChunks = new HashMap<>();
        }

        int uploadedChunksCount = uploadedChunks.size();
        // Estimate total chunks từ fileSize (5MB per chunk)
        int estimatedTotalChunks = (int) Math.ceil((double) session.fileSize() / (5 * 1024 * 1024));
        int totalChunks = Math.max(estimatedTotalChunks, uploadedChunksCount);

        Map<String, Object> progress = new HashMap<>();
        progress.put("uploadId", uploadId);
        progress.put("uploadedChunks", uploadedChunksCount);
        progress.put("totalChunks", totalChunks);
        progress.put("progress", totalChunks > 0 ? (uploadedChunksCount * 100.0 / totalChunks) : 0);
        progress.put("isComplete", false);

        return progress;
    }

    /**
     * Cancel upload và cleanup
     */
    public void cancelChunkedUpload(String uploadId, String userId) {
        UploadSession session = uploadSessions.get(uploadId);

        if (session == null) {
            throw new RuntimeException("Upload session not found");
        }

        if (!session.userId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to upload session");
        }

        cleanupUpload(session);
        uploadSessions.remove(uploadId);
        uploadedChunksMap.remove(uploadId);
    }

    /**
     * Cleanup temp files
     */
    private void cleanupUpload(UploadSession session) {
        try {
            Path tempPath = Paths.get(session.tempPath());
            if (Files.exists(tempPath)) {
                Files.walk(tempPath)
                        .sorted(Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                System.err.println("Failed to delete: " + path);
                            }
                        });
            }
        } catch (IOException e) {
            System.err.println("Failed to cleanup upload: " + e.getMessage());
        }
    }

    /**
     * Upload session record
     */
    record UploadSession(
            String uploadId,
            String fileName,
            Long fileSize,
            String fileType,
            String userId,
            String tempPath,
            Map<Integer, Boolean> uploadedChunks,
            Long createdAt
    ) {}
}

