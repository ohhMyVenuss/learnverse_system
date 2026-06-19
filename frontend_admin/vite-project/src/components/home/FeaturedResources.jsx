import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import ResourceCard from './ResourceCard';

function FeaturedResources() {
  // State quản lý dữ liệu
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // State quản lý UI
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Gọi API lấy danh mục (chạy 1 lần khi trang load)
  useEffect(() => {
    const fetchCats = async () => {
      const cats = await resourceService.getCategories();
      setCategories(cats);
    };
    fetchCats();
  }, []);

  // 2. Gọi API lấy tài liệu (chạy mỗi khi activeTab thay đổi)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Bật loading
      try {
        // Đây là điểm mấu chốt: Gọi Service thay vì filter cứng
        const data = await resourceService.getResources(activeTab);
        setResources(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false); // Tắt loading dù thành công hay thất bại
      }
    };

    fetchData();
  }, [activeTab]); // <-- Dependency: activeTab

  return (
    <section className="py-20 bg-[#fdf8f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center mb-10">
          <span className="inline-block py-1 px-3 rounded-full bg-red-50 text-[#EA454C] text-xs font-bold uppercase tracking-wider mb-2">
            What's New
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Resources & Discussions
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Explore the most active forum topics and the highest-rated study documents uploaded by your peers this week.
          </p>
        </div>

        {/* TABS (Bộ lọc) */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`
                px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${activeTab === cat.id
                  ? 'bg-white text-[#EA454C] shadow-md border-b-2 border-[#EA454C]' // Active Style
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50' // Inactive
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* CONTENT GRID */}
        <div className="min-h-[400px]"> {/* Giữ chiều cao tối thiểu để tránh giật layout */}
          
          {isLoading ? (
            // HIỆU ỨNG LOADING (Spinner)
            <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA454C]"></div>
            </div>
          ) : (
            // DANH SÁCH KẾT QUẢ
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
              {resources.length > 0 ? (
                resources.map((item) => (
                  <ResourceCard key={item.id} data={item} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 py-10 italic">
                  No resources found in this category.
                </div>
              )}
            </div>
          )}
          
        </div>

        {/* PAGINATION DOTS (Trang trí) */}
        <div className="flex justify-center gap-2 mt-12">
           <div className="w-8 h-2 bg-[#EA454C] rounded-full"></div>
           <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
           <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>

      </div>
    </section>
  );
}

export default FeaturedResources;