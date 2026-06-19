import React, { useState } from "react"; 
import { FiEye, FiEyeOff } from 'react-icons/fi';

function InputField({ label, type, icon, value, onChange }) {
    const isPassword = type === 'password'; 
    const [isVisible, setIsVisible] = useState(false);
    
    const currentType = isPassword ? (isVisible ? 'text' : 'password') : type; 
    
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    const paddingClass = (isPassword || icon) ? 'px-10' : 'px-3';

    return (
        <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none h-full">
                        {icon}
                    </div>
                )}
                
                <input
                    type={currentType} 
                    value={value}
                    onChange={onChange}
                    className={`block w-full ${paddingClass} py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                

                {isPassword && (
                    <button
                        type="button" 
                        onClick={toggleVisibility}
                        className="absolute inset-y-0 right-0 pr-3 h-full flex items-center cursor-pointer focus:outline-none"
                    >
                        {isVisible
                            ? <FiEye className="text-gray-400" />
                            : <FiEyeOff className="text-gray-400" />
                        }
                    </button>
                )}
            </div>
        </div>
    );
}

export default InputField;