// src/components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { paymentApi } from '../api/paymentApi';

function PaymentModal({ isOpen, onClose, course }) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(600); // 10 phút

  useEffect(() => {
    if (isOpen && course) {
      createPayment();
    }
  }, [isOpen, course]);

  useEffect(() => {
    if (paymentData && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentData, countdown]);

  const createPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await paymentApi.createPayment(course.id);
      // Redirect trực tiếp đến trang thanh toán PayOS
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">Thanh toán khóa học</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang chuyển đến trang thanh toán...</p>
              <p className="text-sm text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={createPayment}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
