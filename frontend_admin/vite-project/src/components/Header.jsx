// src/components/Header.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// --- SỬA LỖI Ở ĐÂY: Import từ 'react-icons/fi' (Feather Icons) ---
import { FiShoppingCart, FiSun, FiLogOut, FiUser, FiSettings, FiChevronDown, FiBook, FiGlobe } from 'react-icons/fi';

import TopBar from './TopBar';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import CartModal from './CartModal';
import learnverseLogo from '../assets/LearnverseLogo.png';
import { profileApi } from '../api/profileApi';

function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  // State quản lý đóng/mở menu thả xuống
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQuizDropdownOpen, setIsQuizDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState(null);
  const dropdownRef = useRef(null);
  const quizDropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Load profile avatar from backend với caching
  useEffect(() => {
    const loadProfileAvatar = async () => {
      if (isLoggedIn && user) {
        // Kiểm tra cache trước (lưu với key là userId để tránh conflict)
        const cacheKey = `profileAvatar_${user.id || user.email}`;
        const cachedAvatar = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        const CACHE_DURATION = 30 * 60 * 1000; // 30 phút

        // Nếu có cache và chưa hết hạn, sử dụng cache
        if (cachedAvatar && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp, 10);
          if (cacheAge < CACHE_DURATION) {
            setProfileAvatar(cachedAvatar);
            return; // Không cần gọi API
          }
        }

        // Nếu không có cache hoặc cache đã hết hạn, load từ API
        try {
          const profile = await profileApi.getMyProfile();
          if (profile.avatarUrl) {
            setProfileAvatar(profile.avatarUrl);
            // Lưu vào cache
            localStorage.setItem(cacheKey, profile.avatarUrl);
            localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
          }
        } catch (error) {
          console.error('Failed to load profile avatar:', error);
          // Nếu có cache cũ, vẫn sử dụng nó dù đã hết hạn
          if (cachedAvatar) {
            setProfileAvatar(cachedAvatar);
          }
        }
      } else {
        // Clear cache khi logout
        if (user) {
          const cacheKey = `profileAvatar_${user.id || user.email}`;
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_timestamp`);
        }
        setProfileAvatar(null);
      }
    };
    loadProfileAvatar();
  }, [isLoggedIn, user]);

  // Logic: Đóng dropdown khi click ra ngoài khu vực menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (quizDropdownRef.current && !quizDropdownRef.current.contains(event.target)) {
        setIsQuizDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full">
      {/* Thanh đen trên cùng */}
      <TopBar />

      {/* Navbar chính */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* --- LOGO --- */}
            <div className="flex-shrink-0 flex items-center mr-8">
              <Link to="/">
                <img 
                  className="h-10 md:h-12 w-auto object-contain" 
                  src={learnverseLogo} 
                  alt="LearnVerse" 
                />
              </Link>
            </div>

            {/* --- MENU GIỮA (Desktop) --- */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Menu cho Admin - chỉ hiển thị Home, Dashboard, Blog */}
              {user?.role === 'admin' ? (
                <>
                  <Link
                    to="/"
                    className={`font-medium text-sm ${
                      pathname === '/'
                        ? 'text-[#EA454C]'
                        : 'text-gray-700 hover:text-[#EA454C]'
                    }`}
                  >
                    Home +
                  </Link>
                  <Link
                    to="/admin/dashboard"
                    className={`font-medium text-sm ${
                      pathname.startsWith('/admin/dashboard')
                        ? 'text-[#EA454C]'
                        : 'text-gray-700 hover:text-[#EA454C]'
                    }`}
                  >
                    Dashboard +
                  </Link>
                  <Link
                    to="/blog"
                    className={`font-medium text-sm ${
                      pathname.startsWith('/blog')
                        ? 'text-[#EA454C]'
                        : 'text-gray-700 hover:text-[#EA454C]'
                    }`}
                  >
                    Blog
                  </Link>
                </>
              ) : (
                <>
                  {/* Menu cho các role khác (student, instructor, guest) */}
                  <Link
                    to="/"
                    className={`font-medium text-sm ${
                      pathname === '/'
                        ? 'text-[#EA454C]'
                        : 'text-gray-700 hover:text-[#EA454C]'
                    }`}
                  >
                    Home +
                  </Link>

                  {/* Điều hướng Courses phụ thuộc role */}
                  <Link
                    to={
                      user?.role === 'instructor'
                        ? '/instructor/courses'
                        : user?.role === 'student'
                        ? '/courses'
                        : '/'
                    }
                    className={`font-medium text-sm ${
                      pathname.startsWith('/courses') ||
                      pathname.startsWith('/instructor/courses')
                        ? 'text-[#EA454C]'
                        : 'text-gray-700 hover:text-[#EA454C]'
                    }`}
                  >
                    Courses +
                  </Link>

                  {/* Hiển thị Go Learning cho student, Forums cho các role khác */}
                  {user?.role === 'student' ? (
                    <Link
                      to="/go-learning"
                      className={`font-medium text-sm ${
                        pathname.startsWith('/go-learning')
                          ? 'text-[#EA454C]'
                          : 'text-gray-700 hover:text-[#EA454C]'
                      }`}
                    >
                      Go Learning +
                    </Link>
                  ) : (
                    <Link
                      to="/forums"
                      className={`font-medium text-sm ${
                        pathname.startsWith('/forums')
                          ? 'text-[#EA454C]'
                          : 'text-gray-700 hover:text-[#EA454C]'
                      }`}
                    >
                      Forums +
                    </Link>
                  )}
                  
                  {/* Phân quyền: Chỉ hiện nếu là Instructor (giáo viên) */}
                  {user?.role === 'instructor' && (
                    <Link to="/instructor/courses/create" className="text-[#EA454C] font-bold text-sm">Upload Course</Link>
                  )}
                  
                  {/* AI Quizz Tool với Dropdown */}
                  <div className="relative" ref={quizDropdownRef}>
                    <button
                      onClick={() => setIsQuizDropdownOpen(!isQuizDropdownOpen)}
                      className={`font-medium text-sm flex items-center gap-1 ${
                        pathname.startsWith('/quizzes')
                          ? 'text-[#EA454C]'
                          : 'text-gray-700 hover:text-[#EA454C]'
                      }`}
                    >
                      AI Quizz Tool
                      <FiChevronDown className={`text-xs transition-transform duration-200 ${isQuizDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isQuizDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-fade-in-up transform origin-top-left z-50">
                        <Link
                          to="/quizzes/my-quizzes"
                          onClick={() => setIsQuizDropdownOpen(false)}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            pathname.startsWith('/quizzes/my-quizzes')
                              ? 'text-[#EA454C] bg-red-50'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-[#EA454C]'
                          }`}
                        >
                          <FiBook className="mr-3 text-lg" />
                          Quiz của tôi
                        </Link>
                        <Link
                          to="/quizzes/public"
                          onClick={() => setIsQuizDropdownOpen(false)}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            pathname.startsWith('/quizzes/public')
                              ? 'text-[#EA454C] bg-red-50'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-[#EA454C]'
                          }`}
                        >
                          <FiGlobe className="mr-3 text-lg" />
                          Quiz công khai
                        </Link>
                      </div>
                    )}
                  </div>
                  <Link
                    to="/blog"
                    className={`font-medium text-sm ${
                      pathname.startsWith('/blog')
                        ? 'text-[#EA454C]'
                        : 'text-gray-700 hover:text-[#EA454C]'
                    }`}
                  >
                    Blog
                  </Link>
                </>
              )}
            </div>

            {/* --- KHU VỰC BÊN PHẢI (Auth & Tools) --- */}
            <div className="flex items-center gap-4">
              
              {/* Nút Chế độ tối & Giỏ hàng */}
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><FiSun /></button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors"
              >
                 <FiShoppingCart />
                 <span className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">1</span>
              </button>

              {/* LOGIC ĐĂNG NHẬP / ĐĂNG XUẤT */}
              {isLoggedIn && user ? (
                // === TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP (Hiện Avatar & Dropdown) ===
                <div className="flex items-center gap-4">
                  {/* Notification Bell - hiện cho instructor (teacher), admin và student */}
                  {(user.role === 'instructor' || user.role === 'admin' || user.role === 'student') && (
                    <NotificationBell />
                  )}
                  <div className="relative pl-4 border-l border-gray-200" ref={dropdownRef}>
                   
                   {/* Nút bấm vào Avatar */}
                   <button 
                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                     className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"
                   >
                      <div className="text-right hidden md:block">
                          <div className="text-sm font-bold text-gray-800">
                            {user.fullName}
                          </div>
                          <div className="text-xs text-gray-500 uppercase">{user.role}</div>
                      </div>
                      <img 
                        src={profileAvatar || user.avatar} 
                        alt="User" 
                        className="w-10 h-10 rounded-full border-2 border-gray-100 object-cover" 
                      />
                      <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                   </button>

                   {/* Menu Thả Xuống (Dropdown) */}
                   {isDropdownOpen && (
                     <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl py-2 border border-gray-100 animate-fade-in-up transform origin-top-right z-50">
                        
                        {/* Mobile Header cho Dropdown */}
                        <div className="md:hidden px-4 py-2 border-b border-gray-100 mb-2 bg-gray-50">
                           <p className="font-bold text-gray-900 truncate">
                             {user.fullName}
                           </p>
                           <p className="text-xs text-gray-500 uppercase">{user.role}</p>
                        </div>

                        <Link 
                          to="/profile" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#EA454C] transition-colors"
                        >
                          <FiUser className="mr-3 text-lg" /> My Profile
                        </Link>
                        
                        <Link 
                          to="/settings" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#EA454C] transition-colors"
                        >
                          <FiSettings className="mr-3 text-lg" /> Settings
                        </Link>

                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <button 
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut className="mr-3 text-lg" /> Logout
                        </button>
                     </div>
                   )}
                  </div>
                </div>
              ) : (
                // === TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP (Hiện nút Sign In) ===
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <Link 
                    to="/login" 
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <FiUser /> Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#EA454C] hover:bg-[#d93e45] shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}

export default Header;