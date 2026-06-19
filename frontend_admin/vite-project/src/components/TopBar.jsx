import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaLinkedinIn, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

function TopBar() {
  return (
    <div className="bg-[#0f172a] text-white py-2 text-xs hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        
        {/* Trái: Liên hệ */}
        <div className="flex space-x-6">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-400" />
            <span>1442 Crosswind Drive Madisonville</span>
          </div>
          <div className="flex items-center gap-2">
            <FaPhoneAlt className="text-gray-400" />
            <span>+1 45887 77874</span>
          </div>
        </div>

        {/* Phải: Ngôn ngữ, Tiền tệ, Mạng xã hội */}
        <div className="flex items-center gap-6">
          <div className="flex gap-4 border-r border-gray-700 pr-6">
             <span className="cursor-pointer hover:text-gray-300 flex items-center gap-1">🇬🇧 ENG ⌄</span>
             <span className="cursor-pointer hover:text-gray-300">USD ⌄</span>
          </div>
          <div className="flex gap-3">
             <FaFacebookF className="cursor-pointer hover:text-[#EA454C]" />
             <FaInstagram className="cursor-pointer hover:text-[#EA454C]" />
             <FaTwitter className="cursor-pointer hover:text-[#EA454C]" />
             <FaYoutube className="cursor-pointer hover:text-[#EA454C]" />
             <FaLinkedinIn className="cursor-pointer hover:text-[#EA454C]" />
          </div>
        </div>

      </div>
    </div>
  );
}

export default TopBar;