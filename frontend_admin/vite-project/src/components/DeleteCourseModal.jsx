import React, { useState } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

function DeleteCourseModal({ isOpen, onClose, onConfirm, courseTitle }) {
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deleteReason.trim()) {
      alert('Vui lòng nhập lý do xóa khóa học');
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(deleteReason.trim());
      setDeleteReason('');
      onClose();
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Xóa khóa học</h2>
              <p className="text-xs text-gray-500">Nhập lý do xóa để thông báo cho giáo viên và học viên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khóa học
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-200">
              {courseTitle}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do xóa <span className="text-red-500">*</span>
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-y"
              placeholder="Ví dụ: Khóa học vi phạm chính sách, nội dung không phù hợp, bản quyền..."
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Lý do này sẽ được gửi đến giáo viên và tất cả học viên đã đăng ký khóa học này.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !deleteReason.trim()}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận xóa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeleteCourseModal;

