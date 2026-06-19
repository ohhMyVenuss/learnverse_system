// Helper upload ảnh lên Cloudinary
// Hiện tại FE-only, backend chưa lưu imageUrl
// Sau này khi backend hỗ trợ, có thể migrate logic này sang backend

const CLOUD_NAME = 'de9v1oqbq';
const UPLOAD_PRESET = 'learnverse_upload';

export const uploadImage = async (file) => {
  if (!file) return null;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

