
import axios from 'axios';

const CLOUD_NAME = "de9v1oqbq";
const UPLOAD_PRESET = "learnverse_upload";

const uploadService = {
  // Upload file thông thường (image/video) với progress tracking và retry mechanism
  async uploadFile(file, options = {}) {
    //maxSize = fileSize();
    if(file.size > 50 * 1024 * 1024) console.log("valid : 50mb");
    //return file;
    const { 
      onUploadProgress, 
      maxRetries = 3, // Số lần retry mặc định
      retryDelay = 1000, // Delay giữa các lần retry (ms)
    } = options;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "auto");

    let lastError;
    
    // Retry mechanism
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          formData,
          {
            onUploadProgress: onUploadProgress ? (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              // Pass attempt info nếu cần
              onUploadProgress(percentCompleted, attempt + 1, maxRetries + 1);
            } : undefined,
            timeout: 300000, // 5 phút timeout cho video lớn
          }
        );

        return {
          success: true,
          url: response.data.secure_url,
          type: response.data.resource_type,
          original_filename: response.data.original_filename,
          attempts: attempt + 1, // Số lần thử
        };
      } catch (error) {
        lastError = error;
        
        // Nếu không phải lần thử cuối, đợi rồi retry
        if (attempt < maxRetries) {
          const delay = this.calculateRetryDelay(attempt, retryDelay);
          console.warn(
            `Upload failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`,
            error.message
          );
          
          // Đợi trước khi retry
          await this.sleep(delay);
        } else {
          console.error("Cloudinary Upload Error (all retries exhausted):", error);
        }
      }
    }

    // Nếu tất cả retries đều fail
    return {
      success: false,
      error: lastError,
      attempts: maxRetries + 1,
    };
  },

  /**
   * Tính toán delay cho retry (exponential backoff)
   */
  calculateRetryDelay(attempt, baseDelay) {
    // Exponential backoff: baseDelay, 2x, 4x, 8x...
    const delay = baseDelay * Math.pow(2, attempt);
    // Max 30 giây
    return Math.min(delay, 30000);
  },

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Upload document (PDF, Word, etc.) - Lưu trữ trên Cloudinary
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "raw"); // Documents dùng raw type

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // Có thể emit event hoặc callback ở đây nếu cần
          }
        }
      );

      return {
        success: true,
        url: response.data.secure_url,
        public_id: response.data.public_id,
        original_filename: response.data.original_filename,
        bytes: response.data.bytes
      };
    } catch (error) {
      console.error("Cloudinary Document Upload Error:", error);
      return { success: false, error };
    }
  }
};

export default uploadService;

