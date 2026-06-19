import React from 'react';
import { mockCurrentUser } from '../../utils/blogConstants';

/**
 * Form để comment hoặc reply
 * 
 * @param {number|string} postId - ID của post
 * @param {number|string|null} parentCommentId - ID của comment cha (null nếu là root comment)
 * @param {string|null} replyingToName - Tên người được reply (chỉ dùng khi reply)
 * @param {string} draftContent - Nội dung draft hiện tại
 * @param {File|null} draftImageFile - File ảnh draft (nếu có)
 * @param {Function} onContentChange - Callback khi content thay đổi
 * @param {Function} onImageChange - Callback khi chọn ảnh
 * @param {Function} onSubmit - Callback khi submit
 * @param {boolean} isSubmitting - Trạng thái đang submit
 * @param {string} placeholder - Placeholder text
 */
const CommentForm = ({
  postId,
  parentCommentId = null,
  replyingToName = null,
  draftContent = '',
  draftImageFile = null,
  onContentChange,
  onImageChange,
  onSubmit,
  isSubmitting = false,
  placeholder = 'Share your thoughts...',
}) => {
  const isReply = parentCommentId !== null;
  const [imagePreview, setImagePreview] = React.useState(null);

  // Update preview khi draftImageFile thay đổi
  React.useEffect(() => {
    if (draftImageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(draftImageFile);
    } else {
      setImagePreview(null);
    }
  }, [draftImageFile]);

  const handleRemoveImage = () => {
    onImageChange(null);
    setImagePreview(null);
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-3 ${isReply ? 'mt-2' : 'mt-4'}`}>
      {!isReply && (
        <>
          <p className="text-sm font-semibold text-gray-700 mb-1">Add a comment</p>
          <p className="text-xs text-gray-500 mb-2">Posting as {mockCurrentUser.name}</p>
        </>
      )}
      {isReply && replyingToName && (
        <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
          <span className="font-semibold">Replying to</span>
          <span className="font-bold text-[#EA454C]">{replyingToName}</span>
        </p>
      )}
      <textarea
        rows={isReply ? 2 : 3}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[#EA454C] focus:bg-white focus:outline-none transition-colors resize-none"
        value={draftContent}
        onChange={(e) => onContentChange(e.target.value)}
      />

      {/* Image Preview */}
      {imagePreview && (
        <div className="mt-2 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-32 rounded-lg border border-gray-200 object-contain"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-colors"
            title="Remove image"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onImageChange(file);
                if (e.target) e.target.value = '';
              }}
            />
            📎 Attach
          </label>
        </div>
        <button
          disabled={isSubmitting || !draftContent.trim()}
          onClick={onSubmit}
          className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors ${
            isSubmitting || !draftContent.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#EA454C] hover:bg-[#d93e45]'
          }`}
        >
          {isSubmitting ? (isReply ? 'Replying...' : 'Sending...') : isReply ? 'Reply' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default CommentForm;

