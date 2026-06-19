import React, { useState } from 'react';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { BsFacebook } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom'; // Import 1 lần duy nhất

import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';



function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  // Hook gọi BÊN TRONG component
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    
    console.log('Attempting login with:', { email, password }); // Debug log
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        {/* Đã xóa class z-2 */}
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Sign into Your Account
        </h2>

        {/* Hiển thị lỗi Server */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <InputField
          label={<span>Email <span className="text-red-500">*</span></span>}
          type="email"
          icon={<FiMail className="text-gray-400" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

        <InputField
          label={<span>Password <span className="text-red-500">*</span></span>}
          type="password"
          icon={<FiLock className="text-gray-400" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-red-500 border-gray-300 rounded focus:ring-red-400"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-red-500 hover:text-red-400">
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={loading}>
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Login'
          )}
        </Button>

        <div className="relative flex justify-center text-sm my-6">
          <span className="bg-white px-2 text-gray-500">Or</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-gray-300 -translate-y-1/2 -z-10"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="xl">
            <FcGoogle className="h-7 w-7 mr-2" />
            Google
          </Button>
          <Button variant="secondary" size="xl">
            <BsFacebook className="h-7 w-7 mr-2 text-[#1877F2]" />
            Facebook
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Don't you have an account?
          <Link to="/register" className="font-medium text-red-500 hover:text-red-400 ml-1">
            Sign Up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
export default LoginPage;