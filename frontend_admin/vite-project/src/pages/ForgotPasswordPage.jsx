
import React, { useState } from 'react';
import { FiMail } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';

const fakeForgotPasswordAPI = (email) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email !== 'intern@learnverse.com') { 
        reject({ success: false, message: 'Email not found' });
      } else {
        resolve({ success: true, message: 'Reset password success' });
      }
    }, 2000)
  });
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    return newErrors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
  
    setIsLoading(true);

    try {
      const response = await fakeForgotPasswordAPI(email);
      console.log(response.message);
      setIsLoading(false);
      navigate('/email-otp', { state: { email: email } });
    } catch (error) {
      console.error('Reset password fail: ', error.message);
      setIsLoading(false);
      setServerError(error.message);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email to reset your password.
        </p>
        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{serverError}</span>
          </div>
        )}

        <InputField
          label={<span>Email <span className="text-red-500">*</span></span>}
          type="email"
          icon={<FiMail className="text-gray-400" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}

        <div className="mb-4"></div>

        <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang gửi...
            </span>
          ) : (
            'Submit'
          )}
        </Button>

        <div className="mt-8 text-center text-sm text-gray-500">
          Remember Password?
          <Link to="/login" className="font-medium text-red-500 hover:text-red-400 ml-1">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;