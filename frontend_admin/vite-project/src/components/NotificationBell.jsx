import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { notificationApi } from '../api/notificationApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Cache để tránh load lại không cần thiết
  const cacheRef = useRef({
    notifications: null,
    unreadCount: null,
    timestamp: null,
    CACHE_DURATION: 30000, // 30 giây cache
  });
  
  // Debounce timer
  const debounceTimerRef = useRef(null);

  // Load unread count only (lightweight)
  const loadUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count || 0);
      cacheRef.current.unreadCount = count || 0;
      cacheRef.current.timestamp = Date.now();
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Load notifications với caching
  const loadNotifications = async (forceRefresh = false) => {
    // Kiểm tra cache
    const cache = cacheRef.current;
    const now = Date.now();
    const cacheAge = cache.timestamp ? now - cache.timestamp : Infinity;
    
    if (!forceRefresh && cache.notifications && cacheAge < cache.CACHE_DURATION) {
      // Sử dụng cache
      setNotifications(cache.notifications);
      setUnreadCount(cache.unreadCount || 0);
      return;
    }

    try {
      setLoading(true);
      
      // Chỉ load full notifications khi dropdown mở
      // Nếu chỉ cần unread count, chỉ load count
      if (isOpen) {
        const [allNotifications, count] = await Promise.all([
          notificationApi.getMyNotifications(),
          notificationApi.getUnreadCount(),
        ]);
        
        // Hiển thị tất cả thông báo (đã đọc và chưa đọc), nhưng ưu tiên hiển thị unread trước
        const sortedNotifications = (allNotifications || []).sort((a, b) => {
          // Unread trước, sau đó sắp xếp theo thời gian
          if (a.isRead !== b.isRead) {
            return a.isRead ? 1 : -1;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // Chỉ hiển thị 10 thông báo gần nhất trong dropdown
        const displayNotifications = sortedNotifications.slice(0, 10);
        setNotifications(displayNotifications);
        setUnreadCount(count || 0);
        
        // Update cache
        cache.notifications = displayNotifications;
        cache.unreadCount = count || 0;
        cache.timestamp = Date.now();
      } else {
        // Chỉ load unread count nếu dropdown không mở
        await loadUnreadCount();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Nếu lỗi 401/403, có thể do chưa đăng nhập hoặc không có quyền
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Unauthorized to view notifications. Make sure you are logged in.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load unread count khi component mount (lightweight)
  useEffect(() => {
    loadUnreadCount();
  }, []);

  // Lazy load notifications khi dropdown mở
  useEffect(() => {
    if (isOpen) {
      // Load ngay khi mở
      loadNotifications(true);
    }
  }, [isOpen]);

  // Polling với debounce và smart logic
  useEffect(() => {
    let intervalId = null;

    // Clear debounce timer nếu có
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce: Chỉ polling sau khi dropdown đóng 2 giây
    if (!isOpen) {
      debounceTimerRef.current = setTimeout(() => {
        // Chỉ polling unread count (lightweight) mỗi 2 phút
        intervalId = setInterval(() => {
          loadUnreadCount();
        }, 120000); // 2 phút
      }, 2000);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isOpen]);

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.isRead) {
      handleMarkAsRead(notification.id, { stopPropagation: () => {} });
    }
    
    // Điều hướng dựa trên loại thông báo và role của user
    if (notification.course) {
      if (notification.type === 'COURSE_PENDING') {
        // Admin xem course để duyệt
        navigate(`/admin/dashboard`);
      } else if (user?.role === 'instructor') {
        // Instructor xem course của mình
        navigate(`/instructor/courses/${notification.course.id}/edit`);
      } else if (user?.role === 'student') {
        // Student xem chi tiết khóa học
        navigate(`/courses/${notification.course.id}`);
      }
    } else {
      // Thông báo không có course (ví dụ: khóa học bị xóa)
      if (user?.role === 'student' && notification.type === 'INFO') {
        // Student xem danh sách khóa học của họ
        navigate('/courses');
      } else if (user?.role === 'instructor') {
        // Instructor xem danh sách khóa học của họ
        navigate('/instructor/courses');
      } else if (user?.role === 'admin') {
        // Admin xem dashboard
        navigate('/admin/dashboard');
      }
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'COURSE_APPROVED':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'COURSE_REJECTED':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      case 'COURSE_PENDING':
        return <FiBell className="w-5 h-5 text-yellow-500" />;
      case 'INFO':
        return <FiAlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <FiInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'COURSE_APPROVED':
        return 'bg-green-50 border-green-200';
      case 'COURSE_REJECTED':
        return 'bg-red-50 border-red-200';
      case 'COURSE_PENDING':
        return 'bg-yellow-50 border-yellow-200';
      case 'INFO':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  // Load notifications khi mở dropdown (lazy load)
  const handleToggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    // loadNotifications sẽ được gọi trong useEffect khi isOpen thay đổi
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Thông báo</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Xem tất cả
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FiBell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Không có thông báo</p>
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setIsOpen(false);
                  }}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Xem lịch sử thông báo
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-2 rounded-lg ${getNotificationBgColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2 whitespace-pre-line">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

