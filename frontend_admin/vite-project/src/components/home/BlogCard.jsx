import React from 'react';
import { FiCalendar } from 'react-icons/fi'; // Icon lịch

function BlogCard({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
      
      {/* 1. Image Thumbnail */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={data.image} 
          alt={data.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Overlay mờ khi hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>

      {/* 2. Content Body */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#EA454C] transition-colors cursor-pointer">
          {data.title}
        </h3>

        {/* Excerpt (Mô tả ngắn) */}
        <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-grow">
          {data.excerpt}
        </p>

        {/* 3. Footer (Author & Date) */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
           
           {/* Author */}
           <div className="flex items-center space-x-3">
              <img 
                src={data.author.avatar} 
                alt={data.author.name} 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-xs font-semibold text-gray-700">
                by {data.author.name}
              </span>
           </div>

           {/* Date */}
           <div className="flex items-center text-gray-400 text-xs">
              <FiCalendar className="mr-1.5" />
              {data.date}
           </div>

        </div>

      </div>
    </div>
  );
}

export default BlogCard;