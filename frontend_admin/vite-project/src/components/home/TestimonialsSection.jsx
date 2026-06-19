
import React from 'react';
import { FaStar } from 'react-icons/fa';
// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const groupImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

// Mock Data
const reviews = [
  {
    id: 1,
    name: "Brenda Slaton",
    role: "Designer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    title: "Transformed My Career Results",
    content: "As an employer, the platform exceeded my expectations. We swiftly found top-tier talent for our company."
  },
  {
    id: 2,
    name: "Adrian Dennis",
    role: "Designer",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    title: "Enhanced My Study Efficiency",
    content: "The LMS made managing my coursework simple and engaging, with everything I need easily accessible and organized."
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    role: "Developer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    title: "Great Community Support",
    content: "The forums are amazing. I got help with my calculus homework in minutes. Highly recommended!"
  }
];

function TestimonialsSection() {
  return (
    // 1. Background Gradient nhẹ (Hồng sang Trắng)
    <section className="py-20 bg-gradient-to-br from-red-50 via-white to-white overflow-hidden relative">
      
      {/* CSS cho Pagination (Dấu chấm đỏ) */}
      <style>{`
        .testimonials-pagination .swiper-pagination-bullet {
          width: 8px; height: 8px; background: #d1d5db; opacity: 1; transition: all 0.3s;
        }
        .testimonials-pagination .swiper-pagination-bullet-active {
          width: 24px; border-radius: 4px; background: #EA454C;
        }
        .testimonials-pagination {
          position: static !important; margin-top: 30px; display: flex;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* === CỘT TRÁI: TEXT & SLIDER === */}
          <div className="relative">
            
            {/* Header */}
            <div className="mb-10 relative">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center">
                 What People Say About Us <span className="ml-2 text-red-500">♥</span>
               </h2>
               <p className="text-gray-500">
                 Read what our satisfied clients have to say about their experiences with our platform.
               </p>

               {/* Mũi tên vẽ tay (SVG Decor) - Trỏ xuống slider */}
               <div className="absolute right-0 top-full transform translate-y-2 hidden md:block text-gray-400">
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10,10 Q50,10 50,50 T90,90" strokeDasharray="5,5" />
                    <path d="M80,80 L90,90 L80,100" /> {/* Đầu mũi tên giả lập */}
                  </svg>
               </div>
            </div>

            {/* Slider Reviews */}
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1} // Mặc định 1 thẻ
              breakpoints={{
                640: { slidesPerView: 2 }, // Tablet trở lên hiện 2 thẻ
              }}
              pagination={{ clickable: true, el: '.testimonials-pagination' }}
              autoplay={{ delay: 5000 }}
            >
              {reviews.map((item) => (
                <SwiperSlide key={item.id} className="h-auto pb-4 pt-4 px-1">
                  {/* Review Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                    
                    {/* Stars */}
                    <div className="flex text-yellow-400 mb-3 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < item.rating ? "" : "text-gray-300"} />
                      ))}
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">"{item.title}"</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">
                      {item.content}
                    </p>

                    {/* Author */}
                    <div className="flex items-center mt-auto">
                      <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                        <div className="text-gray-400 text-xs">{item.role}</div>
                      </div>
                    </div>

                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Chỗ hiện dấu chấm */}
            <div className="testimonials-pagination"></div>

          </div>

          {/* === CỘT PHẢI: ẢNH NHÓM & BADGE === */}
          <div className="relative">
            {/* Ảnh chính */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
               <img 
                 src={groupImage} 
                 alt="Students Group" 
                 className="w-full h-auto object-cover transform scale-105" // Zoom nhẹ để lấp đầy
               />
               {/* Lớp phủ mờ nhẹ */}
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating Badge (200+ Reviews) */}
            <div className="absolute top-8 -left-8 md:left-[-40px] bg-[#0f172a] text-white p-4 rounded-xl shadow-xl z-20 animate-bounce-slow">
               {/* Avatar Group nhỏ */}
               <div className="flex -space-x-2 mb-2">
                  {[1,2,3,4].map(i => (
                    <img key={i} className="w-8 h-8 rounded-full border-2 border-[#0f172a]" src={`https://i.pravatar.cc/100?img=${i+20}`} alt="" />
                  ))}
               </div>
               <div className="text-xs font-bold pl-1">
                 <span className="text-[#EA454C]">200+</span> Reviews
               </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;