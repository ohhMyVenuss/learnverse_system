import apiClient from '../api/apiClient';

const CHUNK_SIZE = 50 * 1024 * 1024; // 5MB per chunk

/**
 * Chunked Upload Service - Upload file qua backend với chunking
 * Hỗ trợ resume, progress tracking, và error recovery
 */
class ChunkedUploadService {
  /**
   * Upload file với chunking
   * @param {File} file - File cần upload
   * @param {Object} options - Options
   * @returns {Promise<Object>} Upload result với URL
   */
  async uploadFile(file, options = {}) {
    const {
      onProgress,
      onChunkComplete,
      onError,
      chunkSize = CHUNK_SIZE,
    } = options;
    
    try {
      // 1. Initialize upload session
      const uploadId = await this.initUpload(file, onProgress);
      
      // 2. Calculate chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      // 3. Upload chunks
      for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        const start = chunkNumber * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        // Upload chunk
        const result = await this.uploadChunk(
          uploadId,
          chunkNumber + 1, // 1-indexed
          totalChunks,
          chunk,
          file.name,
          onProgress
        );
        
        // Callback khi chunk upload xong
        if (onChunkComplete) {
          onChunkComplete(chunkNumber + 1, totalChunks);
        }
        
        // Nếu upload hoàn tất
        if (result.isComplete) {
          if (onProgress) {
            onProgress(100);
          }
          return {
            success: true,
            url: result.fileUrl,
            uploadId,
          };
        }
        
        // Update progress
        const progress = ((chunkNumber + 1) / totalChunks) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      }
      
      // Nếu đến đây mà chưa complete, có thể có lỗi
      throw new Error('Upload did not complete properly');
      
    } catch (error) {
      console.error('Chunked upload error:', error);
      if (onError) {
        onError(error);
      }
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  /**
   * Initialize upload session
   */
  async initUpload(file, onProgress) {
    try {
      if (onProgress) {
        onProgress(0);
      }
      
      const response = await apiClient.post('/upload/chunk/init', null, {
        params: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
        },
      });
      
      return response.data.uploadId;
    } catch (error) {
      throw new Error(`Failed to initialize upload: ${error.message}`);
    }
  }

  /**
   * Upload a single chunk
   */
  async uploadChunk(uploadId, chunkNumber, totalChunks, chunk, fileName, onProgress) {
    try {
      const formData = new FormData();
      formData.append('uploadId', uploadId);
      formData.append('chunkNumber', chunkNumber);
      formData.append('totalChunks', totalChunks);
      formData.append('chunk', chunk, fileName);
      
      try {
        if (file.size <= 50 * 1024 * 1024) return file;
      } catch(error) {
        throw new Error("Max size is 50MB");
      }
      const response = await apiClient.post('/upload/chunk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // Progress của chunk hiện tại
          const chunkProgress = (progressEvent.loaded / progressEvent.total) * 100;
          // Overall progress
          const overallProgress = ((chunkNumber - 1) / totalChunks) * 100 + (chunkProgress / totalChunks);
          if (onProgress) {
            onProgress(overallProgress);
          }
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to upload chunk ${chunkNumber}: ${error.message}`);
    }
  }

  /**
   * Get upload progress
   */
  async getUploadProgress(uploadId) {
    try {
      const response = await apiClient.get(`/upload/chunk/${uploadId}/progress`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get upload progress: ${error.message}`);
    }
  }

  /**
   * Cancel upload
   */
  async cancelUpload(uploadId) {
    try {
      await apiClient.delete(`/upload/chunk/${uploadId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Resume upload - Upload các chunks còn thiếu
   */
  async resumeUpload(uploadId, file, options = {}) {
    const {
      onProgress,
      chunkSize = CHUNK_SIZE,
    } = options;

    try {
      // Get current progress
      const progress = await this.getUploadProgress(uploadId);
      const uploadedChunks = progress.uploadedChunks || 0;
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      // Upload remaining chunks
      for (let chunkNumber = uploadedChunks + 1; chunkNumber <= totalChunks; chunkNumber++) {
        const start = (chunkNumber - 1) * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        const result = await this.uploadChunk(
          uploadId,
          chunkNumber,
          totalChunks,
          chunk,
          file.name,
          onProgress
        );
        
        if (result.isComplete) {
          if (onProgress) {
            onProgress(100);
          }
          return {
            success: true,
            url: result.fileUrl,
            uploadId,
          };
        }
        
        const progressPercent = (chunkNumber / totalChunks) * 100;
        if (onProgress) {
          onProgress(progressPercent);
        }
      }
      
      throw new Error('Resume upload did not complete');
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new ChunkedUploadService();

