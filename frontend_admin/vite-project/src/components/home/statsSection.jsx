import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import statsService from '../../services/statsService';
import { FiZap } from 'react-icons/fi'; // Icon tia sét vàng

function StatsSection() {
  // 1. State lưu dữ liệu
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    subjects: 0,
    forumTopics: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // 2. Gọi API khi component load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Dữ liệu cấu hình để map (giúp JSX gọn gàng)
  const statItems = [
    { id: 1, label: "Students Enrolled all over World", value: stats.students },
    { id: 2, label: "Total Courses on our Platform", value: stats.courses },
    { id: 3, label: "Subjects & Disciplines Covered", value: stats.subjects },
    { id: 4, label: "Total Forum Topics & Discussions", value: stats.forumTopics },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* KHUNG CHỨA CHÍNH (Màu đen, bo góc) */}
        <div className="bg-[#0f172a] rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden text-center">
          
          {/* --- Trang trí (Decorations) --- */}
          {/* Icon Tia sét (Trái) */}
          <div className="absolute top-10 left-10 text-yellow-400 text-6xl opacity-90 animate-pulse">
            <FiZap />
          </div>
          
          {/* Hình khối tím (Phải) - Dùng SVG hoặc CSS */}
          <div className="absolute top-10 right-10 opacity-80">
             <svg width="60" height="60" viewBox="0 0 50 50" fill="none">
               <path d="M0 0H25V25H0V0Z" fill="#8B5CF6" className="animate-spin-slow"/>
               <path d="M25 25H50V50H25V25Z" fill="#8B5CF6" className="animate-spin-slow"/>
             </svg>
          </div>

          {/* --- Header --- */}
          <div className="relative z-10 max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Achieve Your Goals with LearnVerse
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              92% of active users report significant improvements in study efficiency and resource access.
            </p>
          </div>

          {/* --- Grid Số liệu --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 border-gray-700 relative z-10">
            {statItems.map((item, index) => (
              <div key={item.id} className={`flex flex-col items-center ${index !== 0 ? 'lg:border-l border-gray-700' : ''}`}>
                {/* CON SỐ (Dùng CountUp) */}
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {isLoading ? (
                    <span>0</span>
                  ) : (
                    <CountUp 
                      end={item.value} 
                      duration={2.5} // Chạy trong 2.5 giây
                      separator=","  // Dấu phẩy ngăn cách (253,085)
                      enableScrollSpy={true} // Chỉ chạy khi lướt tới
                      scrollSpyOnce={true}   // Chỉ chạy 1 lần
                    />
                  )}
                </div>
                
                {/* LABEL */}
                <p className="text-gray-400 text-sm">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

export default StatsSection;