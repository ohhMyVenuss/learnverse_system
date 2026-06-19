import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

function TextCell({ cell, onUpdate, onDelete }) {
  const [content, setContent] = useState(cell.content || '');

  useEffect(() => {
    setContent(cell.content || '');
  }, [cell.content]);

  const handleBlur = () => {
    if (content !== cell.content) {
      onUpdate(content);
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    // Auto-update on change for better UX
    onUpdate(e.target.value);
  };

  return (
    <div className="relative group">
      <textarea
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Nhập ghi chú của bạn..."
        className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#EA454C] focus:border-transparent min-h-[100px] text-sm"
        style={{ fontFamily: 'inherit' }}
      />
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
        title="Delete cell"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
}

export default TextCell;

