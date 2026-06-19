/**
 * Video Compression Service
 * Sử dụng Web API (MediaRecorder) && FFmpeg.wasm để compress video
 */
/**
 * Ý tưởng: sử dụng cpu để làm chỗ tạm trú cho video
 * Với video sẽ được compress theo lộ trình: upload video -> sử dụng FFmpeg -> tạo một thẻ <video> ẩn 
 * và vẽ từng khung hình của video đó lên một thẻ <canvas> bằng ctx.drawImage
 * sử dụng canvas để render cái video mới, có cấu hình 30fps, maybe hơn nhưng mà Minh lười xử lý fps lớn:)
 * Với âm thanh, sử dụng media record (web api) để record lại âm thanh có trong video gốc
 * như vậy từ 1 video size lớn tiến hành lược bỏ các khung hình kh quan trọng, ta giữ lại chất lượng video vừa đủ để đảm bảo 
 * mà kh gây áp lực quá lớn lên phia sẻcver
 */

/**
 *uy nhiên, nhược điểm lớn nhất là độ phức tạp tuyến tính -> vì chạy nguyên cả cái video để vẽ và record lại
 * compressVideoFFmpeg
 * tương tự như trên tuy nhiên tối ưu hơn về tốc độ bằng cách tạoh virtual dick
 */
class VideoCompressionService {
  /**
   * Compress video sử dụng Web API (MediaRecorder)
   * Phù hợp cho video nhỏ, không cần thư viện bên ngoài
   */
  async compressVideoWebAPI(file, options = {}) {
    const {
      maxWidth = 1280,
      maxHeight = 720,
      bitrate = 2500000, // 2.5 Mbps
      // cs thhể hiểu bitrate = tốc độ dữ liệu phía web client server
      onProgress,
    } = options;

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        // Tính toán kích thước mới
        let width = video.videoWidth;
        let height = video.videoHeight;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Tạo canvas để render video
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Tạo MediaRecorder để record video
        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: bitrate,
        });
        
        const chunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          resolve(blob);
        };
        
        mediaRecorder.onerror = (error) => {
          reject(error);
        };
        
        // Bắt đầu record
        mediaRecorder.start();
        
        // Play video và draw lên canvas
        video.currentTime = 0;
        video.play();
        
        const drawFrame = () => {
          if (video.ended || video.paused) {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          
          ctx.drawImage(video, 0, 0, width, height);
          
          // Update progress
          if (onProgress) {
            const progress = (video.currentTime / video.duration) * 100;
            onProgress(progress);
          }
          
          requestAnimationFrame(drawFrame);
        };
        
        video.onplay = () => {
          drawFrame();
        };
      };
      
      video.onerror = (error) => {
        reject(new Error('Failed to load video: ' + error.message));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Compress video sử dụng FFmpeg.wasm (cần cài đặt @ffmpeg/ffmpeg)
   * Phù hợp cho video lớn, chất lượng tốt hơn
   */
  async compressVideoFFmpeg(file, options = {}) {
    // Check if FFmpeg is available
    if (typeof window === 'undefined' || !window.FFmpeg) {
      console.warn('FFmpeg.wasm not available, falling back to Web API compression');
      return this.compressVideoWebAPI(file, options);
    }

    const {
      maxWidth = 1280,
      maxHeight = 720,
      quality = 28, // CRF value (lower = better quality, 18-28 recommended)
      onProgress,
    } = options;

    try {
      const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg');
      const ffmpeg = createFFmpeg({ log: true });
      
      if (!ffmpeg.isLoaded()) {
        if (onProgress) onProgress(5);
        await ffmpeg.load();
        if (onProgress) onProgress(10);
      }
      
      // Write input file
      const inputFileName = 'input.' + file.name.split('.').pop();
      ffmpeg.FS('writeFile', inputFileName, await fetchFile(file));
      
      if (onProgress) onProgress(20);
      
      // Compress video
      const outputFileName = 'output.mp4';
      await ffmpeg.run(
        '-i', inputFileName,
        '-vf', `scale=${maxWidth}:${maxHeight}:force_original_aspect_ratio=decrease`,
        '-c:v', 'libx264',
        '-crf', quality.toString(),
        '-preset', 'medium',
        '-c:a', 'aac',
        '-b:a', '128k',
        outputFileName
      );
      
      if (onProgress) onProgress(90);
      
      // Read output file
      const data = ffmpeg.FS('readFile', outputFileName);
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      
      // Cleanup
      ffmpeg.FS('unlink', inputFileName);
      ffmpeg.FS('unlink', outputFileName);
      
      if (onProgress) onProgress(100);
      
      return blob;
    } catch (error) {
      console.error('FFmpeg compression error:', error);
      // Fallback to Web API
      return this.compressVideoWebAPI(file, options);
    }
  }

  /**
   * Smart compress - Tự động chọn method phù hợp
   */
  async compressVideo(file, options = {}) {
    const {
      useFFmpeg = false,
      maxFileSize = 100 * 1024 * 1024, // 100MB
      ...restOptions
    } = options;

    // Nếu file nhỏ hơn maxFileSize, không cần compress
    if (file.size < maxFileSize) {
      console.log('File size is acceptable, skipping compression');
      return file;
    }

    // Chọn compression method
    if (useFFmpeg) {
      return this.compressVideoFFmpeg(file, restOptions);
    } else {
      return this.compressVideoWebAPI(file, restOptions);
    }
  }

  /**
   * Get video info
   */
  async getVideoInfo(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
          size: file.size,
          type: file.type,
        });
        URL.revokeObjectURL(video.src);
      };
      
      video.onerror = (error) => {
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }
}

export default new VideoCompressionService();

