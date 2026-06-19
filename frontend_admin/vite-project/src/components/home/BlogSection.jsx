import React, { useState, useEffect } from 'react';
import blogService from '../../services/blogService';
import BlogCard from './BlogCard';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

function BlogSection() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await blogService.getLatestBlogs();
        setBlogs(data);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <section className="py-20 bg-white">
      
      {/* CSS cho Pagination (Dấu chấm đỏ đặc trưng) */}
      <style>{`
        .blog-pagination .swiper-pagination-bullet {
          width: 8px; height: 8px; background: #d1d5db; opacity: 1; transition: all 0.3s;
        }
        .blog-pagination .swiper-pagination-bullet-active {
          width: 24px; border-radius: 4px; background: #EA454C;
        }
        .blog-pagination {
          position: static !important; margin-top: 40px; display: flex; justify-content: center;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-12">
          <span className="inline-block py-1 px-4 rounded-full bg-red-50 text-[#EA454C] text-xs font-bold uppercase tracking-wider mb-3">
            Blog
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Topic & Discussion
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Explore curated content to enlighten, entertain and engage global readers.
          </p>
        </div>

        {/* --- CONTENT SLIDER --- */}
        {isLoading ? (
           <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA454C]"></div>
           </div>
        ) : (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30} // Khoảng cách giữa các card
            pagination={{ clickable: true, el: '.blog-pagination' }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            breakpoints={{
              0: { slidesPerView: 1 },       // Mobile: 1 thẻ
              768: { slidesPerView: 2 },     // Tablet: 2 thẻ
              1024: { slidesPerView: 3 },    // Desktop: 3 thẻ (như thiết kế)
            }}
            className="pb-4" // Padding bottom cho shadow
          >
            {blogs.map((item) => (
              <SwiperSlide key={item.id} className="h-auto py-2"> 
                <BlogCard data={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* --- PAGINATION DOTS --- */}
        <div className="blog-pagination"></div>

      </div>
    </section>
  );
}

export default BlogSection;