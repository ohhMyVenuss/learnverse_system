import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiClock, FiFileText, FiLoader, FiCheckCircle, FiBook, FiGlobe, FiLock } from 'react-icons/fi';
import { quizApi } from '../../api/quizApi';
import DifficultyBadge from '../../components/quiz/DifficultyBadge';
import Button from '../../components/Button';

function QuizDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCompletedAttempt, setHasCompletedAttempt] = useState(false);

  useEffect(() => {
    loadQuiz();
    checkAttemptHistory();
  }, [id]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      const data = await quizApi.getQuizById(id);
      console.log('Quiz data received:', data);
      console.log('Questions:', data?.questions);
      if (data?.questions && data.questions.length > 0) {
        console.log('First question:', data.questions[0]);
        console.log('First question options:', data.questions[0].options);
      }
      setQuiz(data);
    } catch (err) {
      setError('Không tìm thấy quiz hoặc có lỗi xảy ra');
      console.error('Error loading quiz:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAttemptHistory = async () => {
    try {
      const attempts = await quizApi.getQuizAttemptHistory(id);
      // Kiểm tra xem có attempt nào đã completed chưa
      const completed = attempts && attempts.some(attempt => attempt.isCompleted === true);
      setHasCompletedAttempt(completed);
    } catch (err) {
      // Nếu không có attempt nào hoặc có lỗi, không hiển thị preview
      setHasCompletedAttempt(false);
      console.log('No attempt history or error:', err);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const attempt = await quizApi.startQuizAttempt(id);
      navigate(`/quizzes/${id}/attempt/${attempt.id}`);
    } catch (err) {
      alert('Không thể bắt đầu quiz. Vui lòng thử lại.');
      console.error('Error starting quiz:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="h-12 w-12 text-[#EA454C] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Quiz không tồn tại'}</p>
          <Button onClick={() => navigate('/quizzes/my-quizzes')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/quizzes/my-quizzes')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span>Quay lại</span>
        </button>

        {/* Quiz Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-gray-600 text-lg mb-4">{quiz.description}</p>
              )}
            </div>
          </div>

          {/* Quiz Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <DifficultyBadge difficulty={quiz.difficultyLevel} />
            </div>
            {quiz.subject && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FiBook className="h-5 w-5 text-[#EA454C]" />
                <div>
                  <p className="text-sm text-gray-500">Môn học</p>
                  <p className="text-sm font-semibold text-gray-900">{quiz.subject}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiFileText className="h-5 w-5 text-[#EA454C]" />
              <div>
                <p className="text-sm text-gray-500">Số câu hỏi</p>
                <p className="text-lg font-semibold text-gray-900">
                  {quiz.questions?.length || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FiClock className="h-5 w-5 text-[#EA454C]" />
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(quiz.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Public/Private Badge */}
          {quiz.isPublic !== undefined && (
            <div className="mb-6">
              {quiz.isPublic ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                  <FiGlobe className="h-4 w-4" />
                  Quiz công khai - Mọi người có thể tìm thấy và làm quiz này
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium">
                  <FiLock className="h-4 w-4" />
                  Quiz riêng tư - Chỉ bạn có thể xem quiz này
                </span>
              )}
            </div>
          )}

          {/* Start Button */}
          <Button onClick={handleStartQuiz} size="lg" className="w-full md:w-auto">
            <FiPlay className="inline mr-2 h-5 w-5" />
            Bắt đầu làm bài
          </Button>
        </div>

        {/* Questions Preview - Chỉ hiển thị khi user đã làm xong quiz */}
        {hasCompletedAttempt && quiz.questions && quiz.questions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Xem lại câu hỏi</h2>
            <div className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div
                  key={question.id || index}
                  className="border border-gray-200 rounded-lg p-6 hover:border-[#EA454C] transition-colors"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#EA454C] text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-gray-900 font-medium flex-1">{question.questionText}</p>
                  </div>
                  <div className="ml-11 space-y-2">
                    {question.options?.map((option, optIndex) => {
                      // Options có thể là array of strings hoặc array of objects
                      const optionText = typeof option === 'string' ? option : option?.optionText || option?.text || '';
                      return (
                        <div
                          key={option?.id || optIndex}
                          className={`p-3 rounded-lg ${
                            optIndex === question.correctAnswerIndex
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span>{optionText}</span>
                          {optIndex === question.correctAnswerIndex && (
                            <span className="ml-2 text-green-600 text-sm flex items-center gap-1">
                              <FiCheckCircle className="h-4 w-4" />
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizDetailPage;

