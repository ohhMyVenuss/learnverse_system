import React, { useState, useEffect } from 'react';
import contributorService from '../../services/contributorService';
import ContributorCard from './ContributorCard';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

function TrendingContributors() {
  const [contributors, setContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await contributorService.getTopContributors();
        setContributors(data);
      } catch (error) {
        console.error("Failed to fetch contributors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="py-20 bg-white">
      
      <style>{`
        .contributors-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s ease;
        }
        .contributors-pagination .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #EA454C;
        }
        .contributors-pagination {
          position: static !important;
          margin-top: 40px;
          display: flex;
          justify-content: center;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-red-50 text-[#EA454C] text-xs font-bold uppercase tracking-wider mb-3">
            LearnVerse Top Contributors
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trending Contributors
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Recognizing the top students and educators who actively share knowledge and empower the community.
          </p>
        </div>

        {/* Content Slider */}
        {isLoading ? (
           <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA454C]"></div>
           </div>
        ) : (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            pagination={{ 
                clickable: true,
                el: '.contributors-pagination' // Custom class cho pagination
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              0: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 }, // Desktop hiện 4 thẻ như thiết kế
            }}
            className="pb-4"
          >
            {contributors.map((item) => (
              <SwiperSlide key={item.id} className="h-auto py-4"> 
                {/* py-4 để bóng đổ (shadow) không bị cắt */}
                <ContributorCard data={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Vị trí hiển thị Pagination (Dấu chấm) */}
        <div className="contributors-pagination"></div>

      </div>
    </section>
  );
}

export default TrendingContributors;