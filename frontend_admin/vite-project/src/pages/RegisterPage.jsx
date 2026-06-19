import React, { useState } from "react";
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { BsFacebook } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

function RegisterPage() {
    // role mặc định là student
    const [role, setRole] = useState('student');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const { register, loading, error } = useAuth();

    const validate = () => {
        const newErrors = {};

        if (!fullName) {
            newErrors.fullName = 'Full name is required';
        }

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }
        else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required';
        }
        else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Confirm password does not match';
        }

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

        // Map role UI -> role backend (enum)
        // UI: 'student' | 'teacher'
        // Backend enum: STUDENT | TEACHER
        let backendRole = 'STUDENT';
        if (role === 'teacher') backendRole = 'TEACHER';
        
        const result = await register(email, password, fullName, backendRole);
        
        if (result.success) {
            navigate('/login');
        }
        // Lỗi đã được xử lý trong AuthContext
    };

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit}>
                {/* left col : is difined in Auth Layout, check my design */}

                {/* this code just go for buiding texts in rights col */}
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
                    Sign Up
                </h2>
                <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                    <button
                        type="button"
                        onClick={() => setRole('student')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === 'student'
                                ? 'bg-white text-[#EA454C] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        I am a Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('teacher')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${role === 'teacher'
                                ? 'bg-white text-[#EA454C] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        I am an Instructor
                    </button>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <InputField
                    label={<span>Full Name <span className="text-red-500">*</span></span>}
                    type="text"
                    icon={<FiUser className="text-gray-400" />}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}

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
                    label={<span>Password<span className="text-red-500">*</span></span>}
                    type="password"
                    icon={<FiLock className="text-gray-400" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

                <InputField
                    label={<span>Confirm Password <span className="text-red-500">*</span></span>}
                    type="password"
                    icon={<FiLock className="text-gray-400" />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <input
                            id="agree-terms"
                            name="agree-terms"
                            type="checkbox"
                            className="h-4 w-4 text-red-500 border-gray-300 rounded focus:ring-red-400"
                        />
                        <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                            I agree with{' '}
                            <Link to="/terms" className="font-medium text-red-500 hover:text-red-400" >
                                Terms of Service
                            </Link>
                            {' '} and {' '}
                            <Link to="/privacy" className="font-medium text-red-500 hover:text-red-400">
                                Privacy Policy
                            </Link>
                        </label>
                    </div>
                </div>

                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                    {loading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang đăng ký...
                        </span>
                    ) : (
                        'Sign Up'
                    )}
                </Button>
                <div className="relative flex justify-center text-sm my-6">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                    <div className="absolute inset-x-0 top-1/2 h-px bg-gray-300 -translate-y-1/2 -z-10"></div>
                </div>

                {/* Nút Social */}
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

                {/* Link chân trang (dẫn về Login) */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?
                    <Link to="/login" className="font-medium text-red-500 hover:text-red-400 ml-1">
                        Sign In
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default RegisterPage;