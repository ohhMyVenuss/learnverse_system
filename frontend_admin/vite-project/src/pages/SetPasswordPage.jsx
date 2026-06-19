import React, { useState } from 'react';
import { FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import Button from '../components/Button';

function SetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if(password != confirmPassword){
            alert("Your password not matching with your confirm. Try again! ");
            return;
        }

        console.log('Sending new request reset your password');
        navigate('/login');
    }

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit}>
                <h2 className='text-3xl font-bold text-center text-gray-900 mb-2'>
                    Set new Password
                </h2>

                <p classname="text-center text-gray-600 mb-6">
                    Your new password must be different from previous password
                </p>

                <InputField
                label={<span>Password <span className="text-red-500">*</span></span>}
                type="password"
                icon={<FiLock className="text-gray-400" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />

                <InputField
                label={<span>Password <span className="text-red-500">*</span></span>}
                type="password"
                icon={<FiLock className="text-gray-400" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <div className="mb-4 mt-6"></div>

                <Button type="submit" variant="primary" size="lg">
                    Reset Password
                </Button>
            </form>


        </AuthLayout>
    );
}

export default SetPasswordPage;