import React from 'react';
// 1. Import các icon
import { FiMonitor, FiBriefcase, FiLock, FiPieChart, FiBox, FiActivity, FiZap, FiClock, FiSmile, FiBook, FiCpu, FiPenTool } from 'react-icons/fi';

// 2. Import Swiper và các module
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// 3. Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/pagination';

// Mock data (12 môn học)
const disciplines = [
    {
        id: 1,
        name: 'Computer Science',
        count: '256 documents',
        icon: <FiMonitor className="w-6 h-6" />,
        color: 'bg-blue-100 text-blue-600',
        shadowColor: 'hover:shadow-blue-200'
    },
    {
        id: 2,
        name: 'Mathematics',
        count: '214 documents',
        icon: <FiActivity className="w-6 h-6" />, 
        color: 'bg-indigo-100 text-indigo-600',
        shadowColor: 'hover:shadow-indigo-200'
    },
    {
        id: 3,
        name: 'Medicine',
        count: '174 documents',
        icon: <FiActivity className="w-6 h-6" />, 
        color: 'bg-red-100 text-red-600',
        shadowColor: 'hover:shadow-red-200'
    },
    {
        id: 4,
        name: 'Economic',
        count: '126 documents',
        icon: <FiPieChart className="w-6 h-6" />,
        color: 'bg-pink-100 text-pink-600',
        shadowColor: 'hover:shadow-green-200'
    },
    {
        id: 5,
        name: 'Finance',
        count: '110 documents',
        icon: <FiBox className="w-6 h-6" />,
        color: 'bg-orange-100 text-orange-600',
        shadowColor: 'hover:shadow-orange-200'
    },
    {
        id: 6,
        name: 'Calculus',
        count: '98 documents',
        icon: <FiActivity className="w-6 h-6" />,
        color: 'bg-green-100 text-green-600',
        shadowColor: 'hover:shadow-green-200'
    },
    {
        id: 7,
        name: 'Physics',
        count: '145 documents',
        icon: <FiZap className="w-6 h-6" />,
        color: 'bg-yellow-100 text-yellow-600',
        shadowColor: 'hover:shadow-yellow-200'
    },
    {
        id: 8,
        name: 'History',
        count: '89 documents',
        icon: <FiClock className="w-6 h-6" />,
        color: 'bg-amber-100 text-amber-700',
        shadowColor: 'hover:shadow-amber-200'
    },
    {
        id: 9,
        name: 'Psychology',
        count: '201 documents',
        icon: <FiSmile className="w-6 h-6" />,
        color: 'bg-teal-100 text-teal-600',
        shadowColor: 'hover:shadow-teal-200'
    },
    {
        id: 10,
        name: 'Literature',
        count: '134 documents',
        icon: <FiBook className="w-6 h-6" />,
        color: 'bg-rose-100 text-rose-600',
        shadowColor: 'hover:shadow-rose-200'
    },
    {
        id: 11,
        name: 'Engineering',
        count: '310 documents',
        icon: <FiCpu className="w-6 h-6" />,
        color: 'bg-slate-100 text-slate-600',
        shadowColor: 'hover:shadow-slate-200'
    },
    {
        id: 12,
        name: 'Art & Design',
        count: '92 documents',
        icon: <FiPenTool className="w-6 h-6" />,
        color: 'bg-violet-100 text-violet-600',
        shadowColor: 'hover:shadow-violet-200'
    }
];

function DisciplinesSection() {
    return (
        <section className="py-16 bg-white">
            
            {/* 4. CSS Tùy chỉnh cho dấu chấm (Pagination) */}
            <style>{`
                .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    background: #d1d5db; /* Màu xám */
                    opacity: 1;
                    transition: all 0.3s ease;
                }
                .swiper-pagination-bullet-active {
                    width: 24px; /* Kéo dài ra */
                    border-radius: 4px;
                    background: #EA454C; /* Màu đỏ thương hiệu */
                }
                .swiper-wrapper {
                    padding-bottom: 40px; /* Tạo khoảng trống dưới để chứa dấu chấm */
                }
                .swiper-pagination {
                    bottom: 0 !important; /* Đặt dấu chấm ở dưới cùng */
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-red-50 text-[#EA454C] text-xs font-bold uppercase tracking-wider mb-2">
                        Our Resources
                    </span>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 mt-4">
                        Popular Disciplines
                    </h2>

                    <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
                        Explore essential resources and discussions across 30+ academic disciplines
                    </p>
                </div>

                {/* 5. Thay thế Grid bằng Swiper */}
                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={24} // Khoảng cách giữa các thẻ
                    pagination={{ clickable: true }} // Cho phép click vào dấu chấm
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    // Cấu hình Responsive (Số lượng thẻ trên mỗi dòng)
                    breakpoints={{
                        0: { slidesPerView: 1 },       // Mobile
                        640: { slidesPerView: 2 },     // Tablet nhỏ
                        768: { slidesPerView: 3 },     // Tablet vừa
                        1024: { slidesPerView: 5 },    // Laptop
                        1280: { slidesPerView: 6 },    // Desktop lớn
                    }}
                    className="px-2" // Padding ngang nhẹ để bóng đổ không bị cắt
                >
                    {disciplines.map((item) => (
                        <SwiperSlide key={item.id} className="h-auto">
                            <div
                                className={`
                                    flex flex-col items-center p-4 bg-white border border-gray-100 rounded-xl 
                                    transition-all duration-300 cursor-pointer group 
                                    shadow-md h-full
                                    hover:shadow-xl hover:-translate-y-1 hover:border-transparent
                                    ${item.shadowColor} 
                                `}
                            >
                                {/* Icon Circle */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${item.color}`}>
                                    {item.icon}
                                </div>

                                {/* Tên môn học */}
                                <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-[#EA454C] transition-colors text-center">
                                    {item.name}
                                </h3>

                                {/* Số lượng tài liệu */}
                                <p className="text-xs text-gray-400">
                                    {item.count}
                                </p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

            </div>
        </section>
    );
}

export default DisciplinesSection;