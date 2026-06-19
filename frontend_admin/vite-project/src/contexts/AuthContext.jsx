// src/contexts/AuthContext.jsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextProvider';
import { authApi } from '../api/authApi';

// Function để decode JWT token
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Chuyển đổi Base64Url sang Base64
    
    // Giải mã có hỗ trợ Unicode (UTF-8)
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Chuẩn hóa role từ backend (STUDENT, TEACHER, ADMIN) sang role dùng trên FE
const mapRole = (backendRole) => {
  if (!backendRole) return null;
  switch (backendRole) {
    case 'TEACHER':
      return 'instructor';
    case 'STUDENT':
      return 'student';
    case 'ADMIN':
      return 'admin';
    default:
      return backendRole.toLowerCase();
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true); // Trạng thái khởi tạo

  // Function tạo avatar từ tên cuối
  const generateAvatar = (fullName) => {
    const nameParts = fullName.trim().split(' ');
    const lastName = nameParts.length > 1
      ? nameParts[nameParts.length - 1]  // Lấy từ cuối cùng (tên)
      : fullName;
    const firstLetter = lastName[0].toUpperCase();

    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8', 'F7DC6F'];
    const colorIndex = Math.abs(lastName.charCodeAt(0)) % colors.length;
    const backgroundColor = colors[colorIndex];

    return `https://ui-avatars.com/api/?name=${firstLetter}&background=${backgroundColor}&color=fff&size=200&font-size=0.6`;
  };

  useEffect(() => {
    // Nếu có token trong localStorage nhưng chưa có user data
    if (token && !user) {
      const decodedToken = decodeJWT(token);
      console.log(decodedToken);
      if (decodedToken) {
        const userFullName = decodedToken.fullName || decodedToken.sub?.split('@')[0];
        setUser({
          id: decodedToken.id,
          email: decodedToken.email || decodedToken.sub,
          fullName: userFullName,
          role: mapRole(decodedToken.role),
          avatar: generateAvatar(userFullName)
        });
      }
    }
    setInitializing(false); // Hoàn tất khởi tạo
  }, [token, user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { token } = await authApi.login(email, password);
      const decodedToken = decodeJWT(token);

      setToken(token);
      const userEmail = decodedToken?.sub || email;
      const userFullName = decodedToken?.fullName || userEmail.split('@')[0];

      setUser({
        id: decodedToken?.id,
        email: userEmail,
        fullName: userFullName,
        role: mapRole(decodedToken?.role),
        avatar: generateAvatar(userFullName)
      });
      localStorage.setItem('token', token);

      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName, role) => {
    setLoading(true);
    setError(null);

    try {
      await authApi.register(email, password, fullName, role);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // --- HÀM MỚI: Cập nhật thông tin user ---
  const updateUser = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
  };

  const value = {
    token,
    user,
    loading,
    error,
    initializing, // Export để ProtectedRoute biết đang khởi tạo
    isLoggedIn: !!token,
    login,
    register,
    logout,
    updateUser, // Xuất hàm này ra để dùng ở ProfilePage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

