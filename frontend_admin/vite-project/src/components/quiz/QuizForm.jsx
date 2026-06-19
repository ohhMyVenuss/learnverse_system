import React, { useState } from 'react';
import { FiLoader, FiZap } from 'react-icons/fi';
import FileUploadZone from './FileUploadZone';
import Button from '../Button';
import DifficultyBadge from './DifficultyBadge';

function QuizForm({ onSubmit, isGenerating = false }) {
  const [formData, setFormData] = useState({
    file: null,
    cloudinaryUrl: null,
    title: '',
    description: '',
    numberOfQuestions: 5,
    difficultyLevel: 'EASY',
    subject: '',
    customSubject: '',
    isPublic: false,
  });

  const [errors, setErrors] = useState({});

  // Danh sách môn học phổ biến
  const subjects = [
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
    // 'Khác',
  ];

  const handleFileSelect = (file, cloudinaryUrl) => {
    setFormData({ ...formData, file, cloudinaryUrl });
    setErrors({ ...errors, file: null });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'subject' && value !== 'Khác') {
      setFormData({
        ...formData,
        subject: value,
        customSubject: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });

    }
    setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.file) newErrors.file = 'Vui lòng chọn file';
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (formData.numberOfQuestions < 1 || formData.numberOfQuestions > 50) {
      newErrors.numberOfQuestions = 'Số câu hỏi phải từ 1 đến 50';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formDataToSend = new FormData();
    formDataToSend.append('file', formData.file);
    // Gửi Cloudinary URL nếu có
    if (formData.cloudinaryUrl) {
      formDataToSend.append('cloudinaryUrl', formData.cloudinaryUrl);
    }
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('numberOfQuestions', formData.numberOfQuestions.toString());
    formDataToSend.append('difficultyLevel', formData.difficultyLevel);

    if (formData.subject === 'Khác' && formData.customSubject.trim()) {
      formDataToSend.append('subject', formData.customSubject.trim());
    } else if (formData.subject !== 'Khác' && formData.subject) {
      formDataToSend.append('subject', formData.subject);
    }
    // if (formData.subject) {
    //   formDataToSend.append('subject', formData.subject);
    // }

    // is public or not?
    formDataToSend.append('isPublic', formData.isPublic.toString());
    onSubmit(formDataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tài liệu <span className="text-red-500">*</span>
        </label>
        <FileUploadZone onFileSelect={handleFileSelect} />
        {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiêu đề quiz <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ví dụ: Quiz kiểm tra kiến thức Java cơ bản"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#EA454C] focus:border-transparent transition-all ${errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả (tùy chọn)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Mô tả ngắn gọn về quiz..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA454C] focus:border-transparent resize-none transition-all"
        />
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Môn học / Chủ đề
        </label>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA454C] focus:border-transparent transition-all"
        >
          <option value="">Chọn môn học...</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
          <option value="Khác"> Khác
          </option>
        </select>

        {formData.subject === 'Khác' && (
          <div className="mt-3">
            <input
              type="text"
              name="customSubject"
              value={formData.customSubject}
              onChange={handleChange}
              placeholder="Nhập tên môn học của bạn..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#EA454C] focus:border-transparent transition-all ${errors.customSubject ? 'border-red-300' : 'border-gray-300'
                }`}
            />
            {errors.customSubject && (
              <p className="mt-1 text-sm text-red-600">{errors.customSubject}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Nhập tên môn học tùy chỉnh (ví dụ: Kinh tế học, Triết học, v.v.)
            </p>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Chọn môn học để người khác dễ dàng tìm thấy quiz của bạn
        </p>
      </div>

      {/* Number of Questions & Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số câu hỏi <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="numberOfQuestions"
            value={formData.numberOfQuestions}
            onChange={handleChange}
            min="1"
            max="50"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#EA454C] focus:border-transparent transition-all ${errors.numberOfQuestions ? 'border-red-300' : 'border-gray-300'
              }`}
          />
          {errors.numberOfQuestions && (
            <p className="mt-1 text-sm text-red-600">{errors.numberOfQuestions}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Độ khó <span className="text-red-500">*</span>
          </label>
          <select
            name="difficultyLevel"
            value={formData.difficultyLevel}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA454C] focus:border-transparent transition-all"
          >
            <option value="EASY">Dễ</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HARD">Khó</option>
          </select>
          <div className="mt-2">
            <DifficultyBadge difficulty={formData.difficultyLevel} size="sm" />
          </div>
        </div>
      </div>

      {/* Public/Private Toggle */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <input
          type="checkbox"
          name="isPublic"
          id="isPublic"
          checked={formData.isPublic}
          onChange={handleChange}
          className="w-5 h-5 text-[#EA454C] border-gray-300 rounded focus:ring-[#EA454C] cursor-pointer"
        />
        <label htmlFor="isPublic" className="flex-1 cursor-pointer">
          <span className="block text-sm font-medium text-gray-900">
            Chia sẻ quiz công khai
          </span>
          <span className="block text-xs text-gray-600 mt-1">
            Cho phép người dùng khác tìm thấy và làm quiz này
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <FiLoader className="animate-spin h-5 w-5" />
            <span>Đang tạo quiz với AI...</span>
          </>
        ) : (
          <>
            <FiZap className="h-5 w-5" />
            <span>Tạo quiz với AI</span>
          </>
        )}
      </Button>
    </form>
  );
}

export default QuizForm;

