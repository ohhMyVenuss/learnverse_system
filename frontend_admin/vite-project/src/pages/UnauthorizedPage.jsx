import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-[#2D2B4A] mb-4">403</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Xin lỗi, bạn không có quyền truy cập vào trang này. Vui lòng quay lại trang chủ hoặc liên hệ quản trị viên.
      </p>
      <div className="w-40">
        <Link to="/">
            <Button variant="primary">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;