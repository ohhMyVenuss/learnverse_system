import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiRefreshCw, FiGlobe } from 'react-icons/fi';
import QuizList from '../../components/quiz/QuizList';
import { quizApi } from '../../api/quizApi';
import Button from '../../components/Button';

function MyQuizzesPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      const data = await quizApi.getMyQuizzes();
      // Đảm bảo data luôn là array
      if (Array.isArray(data)) {
        setQuizzes(data);
      } else if (data && Array.isArray(data.data)) {
        // Nếu API trả về object có property data
        setQuizzes(data.data);
      } else {
        console.warn('API trả về dữ liệu không đúng định dạng:', data);
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setQuizzes([]); // Đảm bảo quizzes luôn là array ngay cả khi có lỗi
    } finally {
      setIsLoading(false);
    }
  };

  // Đảm bảo quizzes luôn là array trước khi filter
  const filteredQuizzes = Array.isArray(quizzes)
    ? quizzes.filter(
        (quiz) =>
          quiz &&
          quiz.title &&
          (quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (quiz.description &&
              quiz.description.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz của tôi</h1>
            <p className="text-gray-600">Quản lý và xem tất cả quiz bạn đã tạo</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            {/* <Button
              onClick={() => navigate('/quizzes/public')}
              variant="secondary"
              className="w-full md:w-auto"
            >
              <FiGlobe className="inline mr-2 h-4 w-4" />
              Quiz công khai
            </Button> */}
            <Button
              onClick={loadQuizzes}
              variant="secondary"
              className="w-full md:w-auto"
              disabled={isLoading}
            >
              <FiRefreshCw className={`inline mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button
              onClick={() => navigate('/quizzes/generate')}
              className="w-full md:w-auto"
            >
              <FiPlus className="inline mr-2 h-5 w-5" />
              Tạo quiz mới
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm quiz theo tiêu đề hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA454C] focus:border-transparent transition-all"
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-500">
              Tìm thấy {filteredQuizzes.length} quiz
            </p>
          )}
        </div>

        {/* Quiz List */}
        <QuizList quizzes={filteredQuizzes} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default MyQuizzesPage;

