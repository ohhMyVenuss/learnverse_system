import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaStar, FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaLinkedinIn } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';

function ContributorCard({ data }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col items-center text-center h-full">
      
      <button 
        onClick={() => setLiked(!liked)}
        className="absolute top-4 right-4 text-gray-400 hover:text-[#EA454C] transition-colors"
      >
        {liked ? <FaHeart className="text-[#EA454C]" /> : <FaRegHeart />}
      </button>

      {/* Avatar & Verified Badge */}
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 group-hover:border-red-50 transition-colors">
          <img 
            src={data.avatar} 
            alt={data.name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {/* Dấu tích xanh lá cây */}
        {data.is_verified && (
          <div className="absolute bottom-1 right-1 bg-[#00CBB8] text-white p-1 rounded-full border-2 border-white shadow-sm">
            <FiCheck className="w-3 h-3" strokeWidth={4} />
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="text-lg font-bold text-gray-900 mb-1">{data.name}</h3>
      <p className="text-sm text-gray-500 mb-3">{data.role}</p>

      {/* Rating */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <FaStar className="text-yellow-400" />
        <span className="font-bold text-gray-900 text-sm">{data.rating}</span>
        <span className="text-gray-400 text-sm">({data.reviews} Reviews)</span>
      </div>

      {/* Social Icons */}
      <div className="flex gap-3 mt-auto">
        {[
            { icon: <FaFacebookF />, link: data.socials.facebook },
            { icon: <FaInstagram />, link: data.socials.instagram },
            { icon: <FaTwitter />, link: data.socials.twitter },
            { icon: <FaYoutube />, link: data.socials.youtube },
            { icon: <FaLinkedinIn />, link: data.socials.linkedin },
        ].map((social, idx) => (
            <a 
                key={idx} 
                href={social.link}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#EA454C] hover:text-white transition-all duration-300 text-xs"
            >
                {social.icon}
            </a>
        ))}
      </div>

    </div>
  );
}

export default ContributorCard;