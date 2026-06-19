import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiZap, FiInfo } from 'react-icons/fi';
import QuizForm from '../../components/quiz/QuizForm';
import { quizApi } from '../../api/quizApi';

function GenerateQuizPage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const quiz = await quizApi.generateQuiz(formData);
      if (!quiz || !quiz.id) {
        throw new Error('Phản hồi từ server không hợp lệ');
      }
      setResult(quiz);
      // Tự động chuyển sau 2 giây
      setTimeout(() => {
        navigate(`/quizzes/${quiz.id}`);
      }, 2000);
    } catch (err) {
      console.error('Error generating quiz:', err);
      let errorMessage = 'Có lỗi xảy ra khi tạo quiz. Vui lòng thử lại sau.';
      
      if (err.response) {
        // Server trả về lỗi
        const status = err.response.status;
        if (status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
        } else if (status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (status === 413) {
          errorMessage = 'File quá lớn. Vui lòng chọn file nhỏ hơn 50MB.';
        } else if (status === 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.';
        } else if (status === 504 || err.code === 'ECONNABORTED') {
          errorMessage = 'Request quá thời gian chờ. Vui lòng thử lại với file nhỏ hơn hoặc ít câu hỏi hơn.';
        } else {
          errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;
        }
      } else if (err.request) {
        // Request được gửi nhưng không nhận được phản hồi
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#EA454C] to-[#d83e44] rounded-2xl mb-4 shadow-lg">
            <FiZap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo Quiz với AI
          </h1>
          <p className="text-gray-600">
            Upload tài liệu và để AI tạo quiz tự động cho bạn
          </p>
        </div>

        {/* Success Message */}
        {result && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
            <FiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-green-900 mb-1">
                Tạo quiz thành công!
              </h3>
              <p className="text-sm text-green-700">
                Đang chuyển đến trang chi tiết quiz...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
            <FiAlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-1">Có lỗi xảy ra</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <QuizForm onSubmit={handleSubmit} isGenerating={isGenerating} />
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FiInfo className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">Lưu ý:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Quá trình tạo quiz có thể mất từ 30 giây đến 2 phút tùy thuộc vào độ dài tài liệu và số lượng câu hỏi.</li>
                <li>File sẽ được lưu trữ an toàn trên Cloudinary sau khi upload.</li>
                <li>Vui lòng đợi trong lúc AI xử lý, không tắt trang.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateQuizPage;

