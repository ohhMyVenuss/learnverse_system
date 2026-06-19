// src/components/CartModal.jsx
import React, { useEffect, useState } from 'react';
import { FiX, FiShoppingCart, FiClock, FiCheckCircle, FiCreditCard, FiUser, FiCalendar, FiTrendingUp, FiPackage } from 'react-icons/fi';
import { paymentApi } from '../api/paymentApi';

// Constants
const COLORS = {
  brand: '#EA454C',
  pending: 'orange-600',
  success: 'green-600'
};

const FILTERS = [
  { id: 'all', label: 'Tất cả', icon: FiPackage },
  { id: 'PENDING', label: 'Chờ thanh toán', icon: FiClock },
  { id: 'SUCCESS', label: 'Đã thanh toán', icon: FiCheckCircle }
];

// Helper Components
const StatCard = ({ icon: Icon, label, value, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl p-4 border border-white/90 shadow-md hover:shadow-lg transition-all">
    <div className="flex items-center gap-3">
      <div className={`${bgColor} rounded-lg p-2`}>
        <Icon className={`${iconColor} text-2xl`} />
      </div>
      <div>
        <p className="text-gray-700 text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-gray-900 text-2xl font-black">{value}</p>
      </div>
    </div>
  </div>
);

const FilterButton = ({ filter, isActive, count, onClick }) => {
  const getActiveColor = () => {
    if (!isActive) return 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200';
    if (filter.id === 'all') return 'bg-[#EA454C] text-white shadow-sm';
    if (filter.id === 'PENDING') return 'bg-orange-600 text-white shadow-sm';
    return 'bg-green-600 text-white shadow-sm';
  };

  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2.5 ${getActiveColor()}`}
    >
      <filter.icon className="text-lg" />
      {filter.label}
      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
        {count}
      </span>
    </button>
  );
};

const PaymentCard = ({ payment, onClick, formatCurrency, formatDate }) => {
  const isPending = payment.status === 'PENDING';
  const cardClasses = isPending
    ? 'bg-orange-50 border-2 border-orange-200 hover:border-orange-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
    : 'bg-green-50 border-2 border-green-200 hover:shadow-md';

  return (
    <div onClick={onClick} className={`group relative rounded-2xl p-6 transition-all duration-300 ${cardClasses}`}>
      {/* Status Badge */}
      <div className="absolute -top-3 -right-3 z-10">
        <span className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg ${isPending ? 'bg-orange-500' : 'bg-green-500'} text-white`}>
          {isPending ? (
            <><FiClock className="text-base animate-pulse" /> Chờ xử lý</>
          ) : (
            <><FiCheckCircle className="text-base" /> Hoàn tất</>
          )}
        </span>
      </div>

      <div className="flex items-start justify-between gap-6">
        {/* Left: Course Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${isPending ? 'bg-orange-500' : 'bg-green-500'}`}>
              <FiPackage className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-xl text-gray-900 mb-1 leading-tight">
                {payment.course?.title || 'Khóa học'}
              </h3>
              {payment.course?.instructor?.fullName && (
                <div className="flex items-center gap-2 text-[#EA454C]">
                  <FiUser className="text-sm" />
                  <span className="text-sm font-semibold">{payment.course.instructor.fullName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 ml-[72px]">
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="text-[#EA454C]" />
              <div>
                <p className="text-xs text-gray-500 font-semibold">Ngày tạo</p>
                <p className="text-gray-800 font-bold">{formatDate(payment.createdAt)}</p>
              </div>
            </div>
            {!isPending && payment.paidAt && (
              <div className="flex items-center gap-2 text-sm">
                <FiCheckCircle className="text-emerald-500" />
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Thanh toán</p>
                  <p className="text-gray-800 font-bold">{formatDate(payment.paidAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Price */}
        <div className="text-right flex flex-col items-end gap-3">
          <div className={`px-6 py-4 rounded-xl shadow-md border-2 ${isPending ? 'bg-orange-100 border-orange-200' : 'bg-green-100 border-green-200'}`}>
            <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">Tổng tiền</p>
            <p className="text-2xl font-black text-gray-800">{formatCurrency(payment.amount)}</p>
          </div>
          {isPending && (
            <div className="flex items-center gap-2 text-sm font-bold text-orange-600 animate-pulse">
              <FiCreditCard className="text-lg" />
              <span>Nhấn để thanh toán</span>
            </div>
          )}
        </div>
      </div>

      {isPending && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-orange-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );
};

function CartModal({ isOpen, onClose }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await paymentApi.getCart();
      // Lọc bỏ đơn đã hủy và sắp xếp: PENDING trước, SUCCESS sau
      const filtered = data.filter(p => p.status === 'PENDING' || p.status === 'SUCCESS');
      const sorted = filtered.sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setPayments(sorted);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = async (payment) => {
    if (payment.status === 'PENDING' && payment.course?.id) {
      try {
        // Tạo payment mới (backend tự động set FAILED cho đơn cũ)
        const paymentData = await paymentApi.createPayment(payment.course.id);
        window.open(paymentData.checkoutUrl, '_blank');
        await loadCart();
      } catch (error) {
        console.error('Failed to create payment:', error);
        alert('Không thể tạo link thanh toán. Vui lòng thử lại!');
      }
    }
  };

  const calculateTotal = () => {
    return payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredPayments = () => {
    if (selectedFilter === 'all') return payments;
    return payments.filter(p => p.status === selectedFilter);
  };

  const filteredPayments = getFilteredPayments();
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;
  const successCount = payments.filter(p => p.status === 'SUCCESS').length;

  const stats = [
    { icon: FiPackage, label: 'Tổng đơn', value: payments.length, bgColor: 'bg-red-50', iconColor: `text-[${COLORS.brand}]` },
    { icon: FiClock, label: 'Chờ xử lý', value: pendingCount, bgColor: 'bg-orange-100', iconColor: 'text-orange-600' },
    { icon: FiCheckCircle, label: 'Thành công', value: successCount, bgColor: 'bg-green-100', iconColor: 'text-green-600' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden transform transition-all animate-slideUp border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="relative bg-[#EA454C] p-8 overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-white/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/5 rounded-full blur-2xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-3.5 shadow-xl border border-white/30">
                <FiShoppingCart className="text-white text-3xl drop-shadow-lg" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-white/90 tracking-tight">Lịch Sử Giao Dịch</h2>
                <p className="text-white/75 text-sm mt-1 font-medium">Theo dõi và quản lý thanh toán của bạn</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 backdrop-blur-xl hover:bg-white/30 text-white rounded-xl p-2.5 transition-all hover:rotate-90 duration-300 border border-white/20 hover:border-white/40 shadow-lg"
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Stats */}
          <div className="relative grid grid-cols-3 gap-4 mt-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-gradient-to-b from-gray-50 to-white px-8 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex gap-2">
            {FILTERS.map(filter => (
              <FilterButton
                key={filter.id}
                filter={filter}
                isActive={selectedFilter === filter.id}
                count={filter.id === 'all' ? payments.length : filter.id === 'PENDING' ? pendingCount : successCount}
                onClick={() => setSelectedFilter(filter.id)}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gradient-to-b from-white to-gray-50">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-[#EA454C]" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-20">
              <FiShoppingCart className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredPayments.map(payment => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onClick={() => handlePaymentClick(payment)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {successCount > 0 && (
          <div className="border-t-2 border-gray-100 bg-gray-50 p-8 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-[#EA454C] rounded-2xl p-4 shadow-lg">
                  <FiTrendingUp className="text-white text-3xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">Tổng chi tiêu</p>
                  <p className="text-lg text-gray-800 font-extrabold">{successCount} khóa học đã thanh toán</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 font-bold mb-2 uppercase tracking-wide">Tổng cộng</p>
                <div className="bg-[#EA454C] rounded-2xl px-8 py-4 shadow-lg">
                  <p className="text-3xl font-black text-white drop-shadow-lg">
                    {formatCurrency(calculateTotal())}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;
