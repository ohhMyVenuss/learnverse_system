import React, { useState, useEffect } from 'react';
import { FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { notificationApi } from '../api/notificationApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [allNotifications, count] = await Promise.all([
        notificationApi.getMyNotifications(),
        notificationApi.getUnreadCount(),
      ]);
      
      // Sắp xếp: unread trước, sau đó theo thời gian mới nhất
      const sorted = (allNotifications || []).sort((a, b) => {
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setNotifications(sorted);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Polling mỗi 30 giây
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
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
      handleMarkAsRead(notification.id);
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
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'COURSE_APPROVED':
        return <FiCheckCircle className="w-6 h-6 text-green-500" />;
      case 'COURSE_REJECTED':
        return <FiAlertCircle className="w-6 h-6 text-red-500" />;
      case 'COURSE_PENDING':
        return <FiBell className="w-6 h-6 text-yellow-500" />;
      case 'INFO':
        return <FiAlertCircle className="w-6 h-6 text-orange-500" />;
      default:
        return <FiInfo className="w-6 h-6 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type, isRead) => {
    const baseColors = {
      'COURSE_APPROVED': 'bg-green-50 border-green-200',
      'COURSE_REJECTED': 'bg-red-50 border-red-200',
      'COURSE_PENDING': 'bg-yellow-50 border-yellow-200',
      'INFO': 'bg-orange-50 border-orange-200',
    };
    const defaultColor = 'bg-blue-50 border-blue-200';
    const color = baseColors[type] || defaultColor;
    return `${color} ${isRead ? 'opacity-70' : ''}`;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông báo</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiCheck className="w-4 h-4" />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'unread'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'read'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Đã đọc ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải thông báo...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiBell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">
            {filter === 'unread' 
              ? 'Không có thông báo chưa đọc' 
              : filter === 'read'
              ? 'Không có thông báo đã đọc'
              : 'Không có thông báo nào'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer hover:shadow-md transition-all ${
                !notification.isRead 
                  ? 'border-blue-200 bg-blue-50/30' 
                  : 'border-gray-200'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${getNotificationBgColor(notification.type, notification.isRead)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className={`font-semibold text-lg ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                        )}
                        {notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Có thể thêm chức năng đánh dấu chưa đọc sau
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            title="Đã đọc"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 whitespace-pre-line leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        {new Date(notification.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {notification.course && (
                        <span className="text-xs text-blue-600 hover:underline">
                          Xem chi tiết →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;

