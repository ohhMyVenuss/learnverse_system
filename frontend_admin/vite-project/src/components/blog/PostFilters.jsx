import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { filters } from '../../utils/blogConstants';

/**
 * Component search và filter cho posts
 * 
 * @param {string} searchTerm - Giá trị search hiện tại
 * @param {Function} onSearchChange - Callback khi search thay đổi
 * @param {string} activeFilter - Filter đang active ('all' | 'trending' | 'answered' | 'unanswered')
 * @param {Function} onFilterChange - Callback khi filter thay đổi
 */
const PostFilters = ({ searchTerm, onSearchChange, activeFilter, onFilterChange }) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-md border border-gray-100">
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 shadow-inner">
          <FiSearch className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search posts or keywords..."
            className="ml-3 flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-[#EA454C] hover:text-[#EA454C] transition-colors">
          <FiFilter className="mr-2 w-4 h-4" />
          Advanced filters
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeFilter === filter.id
                ? 'bg-[#EA454C] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PostFilters;

