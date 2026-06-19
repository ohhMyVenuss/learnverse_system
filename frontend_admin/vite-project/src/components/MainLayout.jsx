
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Sử dụng Header (chứa TopBar + Navbar + Auth)

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header luôn nằm trên cùng */}
      <Header />
      
      {/* Nội dung thay đổi (Dashboard, Profile...) sẽ hiện ở đây */}
      {/* Thêm padding-top để tránh bị header fixed che khuất nội dung */}
      <main className="flex-grow bg-gray-50 pt-28 md:pt-32">
        <Outlet />
      </main>
      
      {/* (Tùy chọn) Footer nếu bạn muốn hiện ở các trang trong */}
      {/* <Footer /> */}
    </div>
  );
}

export default MainLayout;