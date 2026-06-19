// components nay dùng để quyết định những phần nào cấp cho người dùng thông qua tokens
// kiểm tra bộ nhớ taonf cục AuthContext xem người dùng đã đăng nhập hay chưa
// nếu đã đăng nhập -> cho phép người dùng thấy homepage
// nếu chưa đăng nhập -> kick người dùng về lại trang đang nhập để đăng nhập

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

// Component bảo vệ route theo trạng thái đăng nhập + vai trò
function ProtectedRoute({ allowedRoles }) {
  const { isLoggedIn, user, initializing } = useAuth();

  // Đang khởi tạo token -> hiển thị loading (không redirect)
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA454C]"></div>
      </div>
    );
  }

  // Chưa đăng nhập -> quay về trang login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có cấu hình allowedRoles thì kiểm tra role của user
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    const isAllowed = userRole && allowedRoles.includes(userRole);

    if (!isAllowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // <Outlet /> hiển thị các route con được bảo vệ
  return <Outlet />;
}

export default ProtectedRoute;
