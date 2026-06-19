import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiArrowRight, FiLoader, FiClock } from 'react-icons/fi';
import { quizApi } from '../../api/quizApi';
import Button from '../../components/Button';

function QuizAttemptPage() {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [questionResults, setQuestionResults] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && quiz.questions) {
      const totalTime = quiz.questions.length * 60; // 60 giây mỗi câu
      setTimeRemaining(totalTime);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isCompleted) {
      handleCompleteQuiz();
    }
  }, [timeRemaining, isCompleted]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      const data = await quizApi.getQuizById(quizId);
      console.log('Quiz data in attempt page:', data);
      console.log('Questions:', data?.questions);
      if (data?.questions && data.questions.length > 0) {
        console.log('First question options:', data.questions[0].options);
      }
      setQuiz(data);
    } catch (err) {
      console.error('Error loading quiz:', err);
      alert('Không thể tải quiz. Vui lòng thử lại.');
      navigate(`/quizzes/${quizId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (optionIndex) => {
    if (isSubmitting || isCompleted) return;
    const questionId = quiz.questions[currentQuestionIndex].id;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex,
    });
  };

  const handleSubmitAnswer = async () => {
    if (isSubmitting) return;

    const question = quiz.questions[currentQuestionIndex];
    const selectedIndex = selectedAnswers[question.id];

    if (selectedIndex === undefined) {
      alert('Vui lòng chọn một đáp án');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await quizApi.submitQuestionAnswer(attemptId, question.id, selectedIndex);
      setQuestionResults({
        ...questionResults,
        [question.id]: result,
      });

      // Tự động chuyển câu tiếp theo sau 2 giây
      setTimeout(() => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          handleCompleteQuiz();
        }
        setIsSubmitting(false);
      }, 2000);
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert('Có lỗi xảy ra khi nộp đáp án. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  const handleCompleteQuiz = async () => {
    if (isCompleted) return;

    try {
      const result = await quizApi.completeQuiz(attemptId);
      setAttemptResult(result);
      setIsCompleted(true);
    } catch (err) {
      console.error('Error completing quiz:', err);
      alert('Có lỗi xảy ra khi hoàn thành quiz.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Quiz không có câu hỏi nào.</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentResult = questionResults[currentQuestion.id];
  const selectedIndex = selectedAnswers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Show completion screen
  if (isCompleted && attemptResult) {
    const totalQuestions = quiz.questions.length;
    const correctAnswers = Object.values(questionResults).filter(
      (r) => r.isCorrect
    ).length;
    const score = attemptResult.totalScore || 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            <div className="mb-6">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                  score >= totalQuestions * 0.7
                    ? 'bg-green-100'
                    : score >= totalQuestions * 0.5
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
                }`}
              >
                {score >= totalQuestions * 0.7 ? (
                  <FiCheckCircle className="h-12 w-12 text-green-600" />
                ) : (
                  <FiXCircle className="h-12 w-12 text-red-600" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoàn thành quiz!</h1>
              <p className="text-gray-600">Kết quả của bạn</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-[#EA454C] mb-1">{score}</p>
                <p className="text-sm text-gray-600">Điểm số</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-[#EA454C] mb-1">
                  {correctAnswers}/{totalQuestions}
                </p>
                <p className="text-sm text-gray-600">Câu đúng</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-[#EA454C] mb-1">
                  {Math.round((correctAnswers / totalQuestions) * 100)}%
                </p>
                <p className="text-sm text-gray-600">Tỷ lệ</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate(`/quizzes/${quizId}`)}
                variant="secondary"
              >
                Xem lại quiz
              </Button>
              <Button onClick={() => navigate('/quizzes/my-quizzes')}>
                Về danh sách quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar & Timer */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>
                  Câu {currentQuestionIndex + 1} / {quiz.questions.length}
                </span>
                <span className="flex items-center gap-2">
                  <FiClock className="h-4 w-4" />
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#EA454C] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="mb-6">
            <div className="flex items-start gap-4 mb-6">
              <span className="flex-shrink-0 w-12 h-12 bg-[#EA454C] text-white rounded-full flex items-center justify-center font-bold text-lg">
                {currentQuestionIndex + 1}
              </span>
              <h2 className="text-2xl font-semibold text-gray-900 flex-1">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 ml-16">
              {currentQuestion.options?.map((option, index) => {
                // Options có thể là array of strings hoặc array of objects
                const optionText = typeof option === 'string' ? option : option?.optionText || option?.text || '';
                const isSelected = selectedIndex === index;
                const isCorrect = currentResult?.isCorrect && index === currentQuestion.correctAnswerIndex;
                const isWrong = currentResult && !currentResult.isCorrect && isSelected;

                return (
                  <button
                    key={option?.id || index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={isSubmitting || isCompleted}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-[#EA454C] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      currentResult
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : isWrong
                          ? 'border-red-500 bg-red-50'
                          : ''
                        : ''
                    } ${isSubmitting || isCompleted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                          isSelected
                            ? 'bg-[#EA454C] text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 text-gray-900">{optionText}</span>
                      {currentResult && isCorrect && (
                        <FiCheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                      {currentResult && isWrong && (
                        <FiXCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Result Feedback */}
            {currentResult && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  currentResult.isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {currentResult.isCorrect ? (
                    <>
                      <FiCheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        Chính xác! Bạn nhận được {currentResult.points} điểm.
                      </span>
                    </>
                  ) : (
                    <>
                      <FiXCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-800 font-medium">
                        Sai rồi. Đáp án đúng là:{' '}
                        {String.fromCharCode(65 + currentQuestion.correctAnswerIndex)}.
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          {!currentResult && (
            <div className="flex justify-end ml-16">
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedIndex === undefined || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin inline mr-2 h-4 w-4" />
                    Đang xử lý...
                  </>
                ) : currentQuestionIndex < quiz.questions.length - 1 ? (
                  <>
                    Câu tiếp theo
                    <FiArrowRight className="inline ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Hoàn thành'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizAttemptPage;

