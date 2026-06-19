import React from 'react';
import { FiBook } from 'react-icons/fi'; // Icon trang trí

// Dùng ảnh placeholder nếu chưa có ảnh thật
const manImage = "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; 

function NewsletterSection() {
  return (
    <section className="bg-[#0f172a] pt-16 md:pt-20 overflow-hidden relative">
      
      {/* Background Decor (Hình vẽ mờ phía sau) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-10 right-1/2 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* CỘT TRÁI: TEXT & FORM */}
          <div className="pb-16 md:pb-20 relative z-10">
            {/* Icon trang trí nhỏ */}
            <div className="absolute -top-10 -left-10 text-purple-500 text-4xl animate-bounce hidden lg:block">
               ⚡
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Transform Access To Education
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg">
              Create Account to Receive Our Newsletter, Course Recommend & Promotions.
            </p>

            {/* Form đăng ký (Input + Button) */}
            <div className="bg-white p-1.5 rounded-full max-w-md flex items-center shadow-lg">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="flex-1 px-6 py-3 text-gray-700 bg-transparent focus:outline-none rounded-full"
              />
              <button className="bg-[#EA454C] hover:bg-[#d93e45] text-white px-8 py-3 rounded-full font-medium transition-colors shadow-md">
                Subscribe
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: ẢNH NGƯỜI (Căn đáy) */}
          <div className="relative flex justify-center md:justify-end items-end h-full mt-8 md:mt-0">
             
             {/* Hình nền vàng sau lưng */}
             <div className="absolute bottom-0 right-0 w-[120%] h-[80%] bg-[#FFC107] rounded-tl-[100px] rounded-tr-[50px] -z-10 translate-x-10"></div>

             {/* Icon bay lơ lửng */}
             <div className="absolute top-0 left-10 text-red-400 text-5xl animate-pulse z-20">
                〰️
             </div>
             <div className="absolute top-10 right-10 text-gray-300 text-3xl animate-bounce z-20 delay-700">
                <FiBook />
             </div>

             {/* Ảnh người */}
             <img 
               src={manImage} 
               alt="Happy Student" 
               className="relative z-10 w-full max-w-sm object-cover rounded-t-full md:rounded-none" // Mask ảnh
               style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} // (Optional) Fade nhẹ chân
             />
          </div>

        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;