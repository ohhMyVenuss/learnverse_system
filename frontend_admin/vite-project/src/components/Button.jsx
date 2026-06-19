import React from 'react';


function Button({ children, variant = 'primary', size = 'default', type = 'button', onClick, disabled }) {
  

  const baseStyle = "w-full flex justify-center items-center rounded-full shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
 
  const variants = {
    primary: 'text-white bg-[#EA454C] hover:bg-[#d83e44] focus:ring-[#EA454C]',
    secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
  };

  
  const sizes = {
    default: 'py-2 px-4 text-sm',
    lg: 'py-3 px-6 text-base',    
    xl: 'py-4 px-8 text-lg'       
  };


  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;