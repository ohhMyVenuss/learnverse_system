
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { FiClock } from 'react-icons/fi';

function EmailOtpPage() {
    const location = useLocation();
    const email = location.state?.email || 'your.email@example.com';

    const [otp, setOtp] = useState(new Array(5).fill(''));
    const inputRefs = useRef([]);

    const [timer, setTimer] = useState(90);
    const navigate = useNavigate();
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => {
            setTimer(prevTimer => prevTimer - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (e, index) => {
        const value = e.target.value;

        // Chỉ chấp nhận 1 chữ số
        if (isNaN(value)) return;

        // Cập nhật mảng state
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 4) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {

        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const otpString = otp.join(''); 
        console.log('Đang xác thực OTP:', otpString);
        // (Gọi API xác thực OTP ở đây)

        navigate('/set-password');
    };

    return (
        <AuthLayout>

            <form onSubmit={handleSubmit}>
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
                    Email OTP
                </h2>
                <p className="text-center text-gray-600 mb-6">
                    OTP sent to your Email Address <span className="font-medium text-gray-900">{email}</span>
                </p>

                <div className="flex justify-center gap-2 mb-4">
                    {otp.map((value, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            value={value}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            ref={(el) => (inputRefs.current[index] = el)}
                        />
                    ))}
                </div>

                <div className="flex justify-center items-center text-gray-500 mb-4">
                    <FiClock className="mr-2" />
                    <span>{formatTime(timer)} s</span>
                </div>

                <Button type="submit" variant="primary" size="lg">
                    Verify & Proceed
                </Button>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Didn't get the OTP?
                    <Link to="#" className="font-medium text-red-500 hover:text-red-400 ml-1">
                        Resend OTP
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}

export default EmailOtpPage;