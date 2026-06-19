import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiBook, FiRefreshCw } from 'react-icons/fi';
import QuizList from '../../components/quiz/QuizList';
import { quizApi } from '../../api/quizApi';
import Button from '../../components/Button';

function PublicQuizzesPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');

  const allSubjects = [
    'Toán học',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Lịch sử',
    'Địa lý',
    'Văn học',
    'Tiếng Anh',
    'Tin học',
    'Công nghệ',
    'Khoa học',
  ];

  useEffect(() => {
    loadQuizzes();
  }, [selectedSubject, searchTerm]);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      // Nếu chọn "Khác" và có input tùy chỉnh, dùng input đó để tìm kiếm
      // Nếu không, dùng selectedSubject bình thường
      const subjectToSearch = (selectedSubject === 'Khác' && customSubjectInput.trim()) 
        ? customSubjectInput.trim() 
        : (selectedSubject && selectedSubject !== 'Khác' ? selectedSubject : null);
      
      const data = await quizApi.getPublicQuizzes(
        subjectToSearch,
        searchTerm || null
      );
      setQuizzes(data);
      
      // Lấy danh sách subjects từ quizzes (bao gồm cả môn học tùy chỉnh)
      const uniqueSubjects = [...new Set(data.map(q => q.subject).filter(Boolean))];
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadQuizzes();
  };

  const handleSubjectFilter = (subject) => {
    if (subject === 'Khác') {
      // Khi chọn "Khác", set selectedSubject nhưng không clear customSubjectInput
      setSelectedSubject('Khác');
    } else {
      setSelectedSubject(subject === selectedSubject ? '' : subject);
      setCustomSubjectInput(''); // Clear custom input khi chọn môn khác
    }
  };

  const handleCustomSubjectSearch = () => {
    if (customSubjectInput.trim()) {
      loadQuizzes();
    }
  };

  const handleClearFilters = () => {
    setSelectedSubject('');
    setCustomSubjectInput('');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#EA454C] to-[#d83e44] rounded-xl">
              <FiBook className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quiz công khai</h1>
              <p className="text-gray-600">Khám phá và làm các quiz được chia sẻ bởi cộng đồng</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm quiz theo tiêu đề hoặc môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA454C] focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-[#EA454C] text-white rounded-lg hover:bg-[#d83e44] transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Subject Filters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FiFilter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Lọc theo môn học:</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => handleClearFilters()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedSubject === '' && !customSubjectInput
                    ? 'bg-[#EA454C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {allSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectFilter(subject)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSubject === subject
                      ? 'bg-[#EA454C] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
              <button
                onClick={() => handleSubjectFilter('Khác')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedSubject === 'Khác'
                    ? 'bg-[#EA454C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Khác
              </button>
            </div>

            {/* Input cho môn học tùy chỉnh khi chọn "Khác" */}
            {selectedSubject === 'Khác' && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomSubjectSearch();
                    }
                  }}
                  placeholder="Nhập tên môn học để tìm kiếm..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA454C] focus:border-transparent transition-all"
                />
                <button
                  onClick={handleCustomSubjectSearch}
                  disabled={!customSubjectInput.trim()}
                  className="px-4 py-2 bg-[#EA454C] text-white rounded-lg hover:bg-[#d83e44] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Tìm
                </button>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {(selectedSubject || searchTerm || customSubjectInput) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Đang lọc:</span>
              {selectedSubject && selectedSubject !== 'Khác' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Môn: {selectedSubject}
                  <button
                    onClick={() => setSelectedSubject('')}
                    className="ml-2 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedSubject === 'Khác' && customSubjectInput && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  Môn: {customSubjectInput}
                  <button
                    onClick={() => {
                      setSelectedSubject('');
                      setCustomSubjectInput('');
                    }}
                    className="ml-2 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Tìm: {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            Tìm thấy <span className="font-semibold text-gray-900">{quizzes.length}</span> quiz
          </p>
          <Button
            onClick={loadQuizzes}
            variant="secondary"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        {/* Quiz List */}
        <QuizList quizzes={quizzes} isLoading={isLoading} showCreator={true} />

        {/* Empty State */}
        {!isLoading && quizzes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
            <FiBook className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy quiz nào
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedSubject || searchTerm || customSubjectInput
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Chưa có quiz công khai nào. Hãy tạo quiz đầu tiên!'}
            </p>
            {!selectedSubject && !searchTerm && !customSubjectInput && (
              <Button onClick={() => navigate('/quizzes/generate')}>
                Tạo quiz mới
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicQuizzesPage;