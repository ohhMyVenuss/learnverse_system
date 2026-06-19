import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';

function ResourceCard({ data }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
      
      {/* --- ẢNH HEADER --- */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={data.thumbnail} 
          alt={data.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy" // Tăng tốc độ tải trang
        />
        
        {/* Nút Tim (Like) */}
        <button 
          onClick={() => setLiked(!liked)}
          className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
        >
          {liked ? <FaHeart className="text-[#EA454C]" /> : <FaRegHeart className="text-gray-400" />}
        </button>

        {/* Tags (Góc phải) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
           {data.tags.map((tag, idx) => (
             <span key={idx} className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-gray-700 shadow-sm flex items-center">
                {/* Chấm đỏ trang trí cho tag đầu tiên */}
                {idx === 0 && <span className="w-1.5 h-1.5 bg-[#EA454C] rounded-full mr-1.5"></span>}
                {tag}
             </span>
           ))}
        </div>
      </div>

      {/* --- BODY CONTENT --- */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Tác giả & Badge Category */}
        <div className="flex justify-between items-center mb-3">
           <div className="flex items-center space-x-2">
              <img src={data.author.avatar} alt={data.author.name} className="w-6 h-6 rounded-full object-cover border border-gray-200" />
              <span className="text-xs text-gray-500 font-medium truncate max-w-[100px]">
                {data.author.name}
              </span>
           </div>
           <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${data.badge_color}`}>
             {data.category_label}
           </span>
        </div>

        {/* Tiêu đề (cắt bớt nếu quá dài) */}
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#EA454C] transition-colors">
          {data.title}
        </h3>

        {/* Footer: Rating */}
        <div className="mt-auto flex items-center text-xs font-medium text-gray-500 pt-3 border-t border-gray-50">
           <div className="flex text-yellow-400 mr-1">
             <FaStar />
           </div>
           <span className="text-gray-900 font-bold mr-1">{data.rating}</span>
           <span>({data.reviews} Reviews)</span>
        </div>

      </div>
    </div>
  );
}

export default ResourceCard;