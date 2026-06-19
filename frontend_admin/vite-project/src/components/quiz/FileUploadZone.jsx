import React, { useRef, useState } from 'react';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle } from 'react-icons/fi';
import uploadService from '../../services/uploadService';

function FileUploadZone({ onFileSelect, onUploadProgress, acceptedTypes = '.pdf,.doc,.docx' }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);

  const handleFileChange = async (file) => {
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedTypes = ['pdf', 'doc', 'docx'];
    if (!allowedTypes.includes(fileExtension)) {
      alert('Chỉ hỗ trợ file PDF, DOC, DOCX');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('File quá lớn. Kích thước tối đa là 50MB');
      return;
    }

    setSelectedFile(file);

    // Upload lên Cloudinary trước
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadService.uploadDocument(file);
      if (result.success) {
        setCloudinaryUrl(result.url);
        // Gửi cả file và cloudinaryUrl cho parent component
        onFileSelect(file, result.url);
        if (onUploadProgress) {
          onUploadProgress({ success: true, url: result.url });
        }
      } else {
        console.warn('Cloudinary upload failed, but file is still available for backend');
        // Vẫn gửi file nếu Cloudinary fail
        onFileSelect(file, null);
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      // Vẫn gửi file nếu có lỗi
      onFileSelect(file, null);
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setCloudinaryUrl(null);
    setUploadProgress(0);
    onFileSelect(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#EA454C] bg-red-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={(e) => handleFileChange(e.target.files[0])}
            className="hidden"
          />
          <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Kéo thả file vào đây hoặc click để chọn
          </p>
          <p className="text-xs text-gray-500">
            Hỗ trợ: PDF, Word (.doc, .docx) - Tối đa 50MB
          </p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-1">
              <FiFile className="h-8 w-8 text-[#EA454C] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
              type="button"
            >
              <FiX className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Đang lưu trữ trên Cloudinary...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#EA454C] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Success Indicator */}
          {cloudinaryUrl && !isUploading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
              <FiCheckCircle className="h-4 w-4" />
              <span>Đã lưu trữ trên Cloudinary</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUploadZone;

