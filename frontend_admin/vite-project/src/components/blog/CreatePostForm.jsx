import React from 'react';
import { FiPaperclip } from 'react-icons/fi';
import RoleBadge from './RoleBadge';
import { mockCurrentUser } from '../../utils/blogConstants';

/**
 * Form tạo bài viết mới
 * 
 * @param {Object} newPost - State của form (title, content, tags, imageFile)
 * @param {Function} onPostChange - Callback khi form thay đổi
 * @param {Function} onImageChange - Callback khi chọn ảnh
 * @param {Function} onSubmit - Callback khi submit form
 * @param {boolean} isPublishing - Trạng thái đang publish
 */
const CreatePostForm = ({ newPost, onPostChange, onImageChange, onSubmit, isPublishing }) => {
  const [imagePreview, setImagePreview] = React.useState(null);

  // Update preview khi imageFile thay đổi
  React.useEffect(() => {
    if (newPost.imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(newPost.imageFile);
    } else {
      setImagePreview(null);
    }
  }, [newPost.imageFile]);

  const handleRemoveImage = () => {
    onImageChange(null);
    setImagePreview(null);
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-gray-200/60">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-gray-500">
        <div className="flex items-center gap-3">
          <FiPaperclip />
          Share your story
        </div>
        <div className="flex items-center text-gray-700">
          <span className="text-xs uppercase tracking-wide text-gray-500">Posting as</span>
          <p className="ml-3 text-sm font-semibold text-gray-900">{mockCurrentUser.name}</p>
          <RoleBadge role={mockCurrentUser.role} className="ml-3" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <input
          type="text"
          placeholder="Post title"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none"
          value={newPost.title}
          onChange={(e) => onPostChange({ ...newPost, title: e.target.value })}
        />
        <textarea
          placeholder="Write the core message..."
          rows={4}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none"
          value={newPost.content}
          onChange={(e) => onPostChange({ ...newPost, content: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none"
          value={newPost.tags}
          onChange={(e) => onPostChange({ ...newPost, tags: e.target.value })}
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-400">
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
            Attach cover image
          </label>
          {newPost.imageFile && (
            <span className="text-xs text-gray-500">{newPost.imageFile.name}</span>
          )}
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Cover preview"
              className="max-h-48 rounded-2xl border-2 border-gray-200 object-contain shadow-md"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Every role (Admin / Instructor / Student) can publish openly.
        </p>
        <button
          onClick={onSubmit}
          disabled={isPublishing}
          className={`rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#EA454C]/30 transition hover:-translate-y-0.5 ${
            isPublishing
              ? 'bg-[#EA454C]/70 cursor-not-allowed'
              : 'bg-[#EA454C] hover:bg-[#d93e45]'
          }`}
        >
          {isPublishing ? 'Publishing...' : 'Publish now'}
        </button>
      </div>
    </div>
  );
};

export default CreatePostForm;

