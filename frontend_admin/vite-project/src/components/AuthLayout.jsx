
import React from 'react';
import { Link } from 'react-router-dom'; 


import loginIllustration from '../assets/login-illustration.png';
import welcomeSection from '../assets/Welcome Section.png';
import learnverseLogo from '../assets/LearnverseLogo-removebg-preview.png'; 


function AuthLayout({ children }) {
  return (
    <div className="flex w-full min-h-screen">

      <div className="flex flex-1 flex-col justify-center items-center p-8 bg-[#fdf8f8]">
        <div className="w-full max-w-md text-center">
          <img
            src={loginIllustration}
            alt="Login Illustration"
            className="w-auto h-auto max-w-xs mx-auto mb-8"
          />
          <img
            src={welcomeSection}
            alt="Welcome Section"
            className="w-auto h-auto max-w-md mx-auto mb-8"
          />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col justify-center items-center p-8 bg-white">
        

        <div className="absolute top-8 left-0 right-0 px-8 flex justify-between items-center w-full max-w-md mx-auto">
          <Link
            to="/"
            className="font-medium text-red-500 hover:text-red-400">
            Back to Home
          </Link>
          <img src={learnverseLogo} alt="Learnverse Logo" className="h-20" />
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>

      </div>
    </div>
  );
}

export default AuthLayout;