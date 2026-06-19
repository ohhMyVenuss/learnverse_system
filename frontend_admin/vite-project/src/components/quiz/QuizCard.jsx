import React from 'react';
import { FiClock, FiFileText, FiArrowRight, FiBook, FiGlobe, FiLock, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DifficultyBadge from './DifficultyBadge';

function QuizCard({ quiz, showCreator = false }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#EA454C] transition-colors">
              {quiz.title}
            </h3>
            {quiz.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{quiz.description}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <DifficultyBadge difficulty={quiz.difficultyLevel} />
          {quiz.subject && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
              <FiBook className="h-3 w-3" />
              {quiz.subject}
            </span>
          )}
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <FiFileText className="h-4 w-4" />
            {quiz.questions?.length || 0} câu hỏi
          </span>
          {quiz.isPublic && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
              <FiGlobe className="h-3 w-3" />
              Công khai
            </span>
          )}
          {showCreator && quiz.createdByFullName && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
              <FiUser className="h-3 w-3" />
              {quiz.createdByFullName}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <FiClock className="h-3 w-3" />
            {formatDate(quiz.createdAt)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/quizzes/${quiz.id}`);
            }}
            className="flex items-center gap-1 text-[#EA454C] hover:text-[#d83e44] font-medium text-sm transition-colors"
          >
            Xem chi tiết
            <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizCard;

