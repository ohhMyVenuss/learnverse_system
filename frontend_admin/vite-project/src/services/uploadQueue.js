/**
 * UploadQueue - Quản lý upload song song nhiều file với giới hạn concurrent
 * Tối ưu hiệu suất bằng cách upload nhiều file cùng lúc nhưng không quá tải
 */
class UploadQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.active = 0;
    this.maxConcurrent = maxConcurrent;
    this.onProgressCallbacks = new Map();
    this.onCompleteCallbacks = new Map();
    this.onErrorCallbacks = new Map();
    this.pausedTasks = new Set(); // Tasks đang bị pause
    this.taskStates = new Map(); // State của từng task (paused, active, queued)
  }

  /**
   * Thêm upload task vào queue
   * @param {string} id - Unique ID cho upload task
   * @param {Function} uploadFn - Function thực hiện upload (phải return Promise)
   * @param {Object} options - Options cho upload
   * @returns {Promise} Promise resolve với kết quả upload
   */
  async add(id, uploadFn, options = {}) {
    return new Promise((resolve, reject) => {
      const priority = options.priority || 0; // Higher priority = processed first
      
      const task = {
        id,
        uploadFn,
        resolve,
        reject,
        options,
        retries: options.maxRetries || 0,
        currentRetry: 0,
        priority,
        createdAt: Date.now(),
      };

      // Insert vào queue theo priority
      if (this.queue.length === 0 || priority > this.queue[this.queue.length - 1].priority) {
        this.queue.push(task);
      } else {
        // Insert vào đúng vị trí theo priority
        let insertIndex = this.queue.length;
        for (let i = 0; i < this.queue.length; i++) {
          if (priority > this.queue[i].priority) {
            insertIndex = i;
            break;
          }
        }
        this.queue.splice(insertIndex, 0, task);
      }

      // Set state
      this.taskStates.set(id, 'queued');

      // Lưu callbacks
      if (options.onProgress) {
        this.onProgressCallbacks.set(id, options.onProgress);
      }
      if (options.onComplete) {
        this.onCompleteCallbacks.set(id, options.onComplete);
      }
      if (options.onError) {
        this.onErrorCallbacks.set(id, options.onError);
      }

      // Bắt đầu xử lý queue
      this.process();
    });
  }

  /**
   * Xử lý queue - chạy upload tasks song song
   */
  async process() {
    // Nếu đã đạt max concurrent hoặc queue rỗng, dừng
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    // Tìm task không bị pause
    let taskIndex = -1;
    for (let i = 0; i < this.queue.length; i++) {
      if (!this.pausedTasks.has(this.queue[i].id)) {
        taskIndex = i;
        break;
      }
    }

    // Nếu tất cả tasks đều bị pause, dừng
    if (taskIndex === -1) {
      return;
    }

    // Lấy task tiếp theo
    const task = this.queue.splice(taskIndex, 1)[0];
    this.active++;
    this.taskStates.set(task.id, 'active');

    try {
      // Thực hiện upload với retry mechanism
      const result = await this.executeWithRetry(task);
      
      // Callback onComplete
      const onComplete = this.onCompleteCallbacks.get(task.id);
      if (onComplete) {
        onComplete(result);
      }

      // Resolve promise
      task.resolve(result);
    } catch (error) {
      // Callback onError
      const onError = this.onErrorCallbacks.get(task.id);
      if (onError) {
        onError(error);
      }

      // Reject promise
      task.reject(error);
    } finally {
      // Cleanup callbacks
      this.onProgressCallbacks.delete(task.id);
      this.onCompleteCallbacks.delete(task.id);
      this.onErrorCallbacks.delete(task.id);
      this.taskStates.delete(task.id);
      this.pausedTasks.delete(task.id);

      // Giảm số lượng active và tiếp tục xử lý queue
      this.active--;
      this.process();
    }
  }

  /**
   * Pause một task cụ thể
   */
  pause(id) {
    if (this.taskStates.get(id) === 'active') {
      this.pausedTasks.add(id);
      this.taskStates.set(id, 'paused');
      return true;
    }
    return false;
  }

  /**
   * Resume một task đã pause
   */
  resume(id) {
    if (this.pausedTasks.has(id)) {
      this.pausedTasks.delete(id);
      this.taskStates.set(id, 'queued');
      // Restart processing
      this.process();
      return true;
    }
    return false;
  }

  /**
   * Pause tất cả tasks
   */
  pauseAll() {
    const pausedIds = [];
    this.queue.forEach(task => {
      if (!this.pausedTasks.has(task.id)) {
        this.pausedTasks.add(task.id);
        this.taskStates.set(task.id, 'paused');
        pausedIds.push(task.id);
      }
    });
    return pausedIds;
  }

  /**
   * Resume tất cả tasks
   */
  resumeAll() {
    const resumedIds = Array.from(this.pausedTasks);
    this.pausedTasks.clear();
    resumedIds.forEach(id => {
      this.taskStates.set(id, 'queued');
    });
    this.process();
    return resumedIds;
  }

  /**
   * Get task state
   */
  getTaskState(id) {
    return this.taskStates.get(id) || 'unknown';
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeCount: this.active,
      pausedCount: this.pausedTasks.size,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Thực hiện upload với retry mechanism
   */
  async executeWithRetry(task) {
    const maxRetries = task.retries;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Wrap uploadFn để track progress
        const uploadFnWithProgress = async () => {
          const progressCallback = this.onProgressCallbacks.get(task.id);
          
          if (progressCallback) {
            // Nếu uploadFn hỗ trợ onUploadProgress, wrap nó
            return await task.uploadFn((progress) => {
              progressCallback(progress, attempt + 1, maxRetries + 1);
            });
          } else {
            return await task.uploadFn();
          }
        };

        const result = await uploadFnWithProgress();
        return result;
      } catch (error) {
        lastError = error;
        task.currentRetry = attempt + 1;

        // Nếu còn retry, đợi một chút rồi thử lại
        if (attempt < maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          console.warn(`Upload ${task.id} failed, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries + 1})`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Tính toán delay cho retry (exponential backoff)
   */
  calculateRetryDelay(attempt) {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Lấy số lượng tasks đang chờ
   */
  getQueueLength() {
    return this.queue.length;
  }

  /**
   * Lấy số lượng tasks đang active
   */
  getActiveCount() {
    return this.active;
  }

  /**
   * Clear queue (hủy tất cả tasks chờ)
   */
  clear() {
    this.queue.forEach(task => {
      task.reject(new Error('Upload queue cleared'));
    });
    this.queue = [];
  }

  /**
   * Cancel một task cụ thể
   */
  cancel(id) {
    const taskIndex = this.queue.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      const task = this.queue.splice(taskIndex, 1)[0];
      task.reject(new Error('Upload cancelled'));
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const uploadQueue = new UploadQueue(3); // Max 3 concurrent uploads

// Export class để có thể tạo instance mới nếu cần
export default UploadQueue;

