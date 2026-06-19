import React from 'react';
import { FiSearch, FiBookOpen } from 'react-icons/fi';

// Import tài nguyên 
import backgroundShape from '../../assets/Yellowvector.png'; // Hình oval vàng lớn
import girlShape from '../../assets/Cheerful-Indian-College-Student-Girl-Transparent-Image 1.png';
import purpleVector from '../../assets/VectorBlueSec.png'; // Hình tím đậm bên cạnh hình vàng
import decorVector from '../../assets/loxo.png'; // Hình lò xo đỏ
// import redVector from '../../assets/redVector.png';
function HeroSection() {
  return (
    <section className="relative pt-10 pb-20 lg:pt-20 overflow-hidden">
      
      {/* === LỚP CAO NHẤT: AMBIENT LIGHTS (Các đốm sáng trang trí - CSS Blobs) === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]">
        {/* Blob 1 - Xanh lá (Green) - Top Left */}
        <div 
          className="absolute top-10 left-10 w-[110px] h-[110px] animate-pulse z-[100]"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 150, 0.5) 0%, rgba(0, 200, 100, 0.2) 50%, rgba(0, 150, 80, 0.1) 100%)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            filter: 'blur(20px)',
            mixBlendMode: 'screen',
            boxShadow: '0 0 40px rgba(0, 255, 150, 0.3), 0 0 70px rgba(0, 200, 100, 0.2)',
            transform: 'rotate(-15deg)',
            animation: 'pulse 4s ease-in-out infinite',
            zIndex: 100
          }}
        />
        
        {/* Blob 2 - Đỏ/Hồng (Red/Pink) - Bottom Left */}
        <div 
          className="absolute bottom-20 left-1/4 w-[100px] h-[100px] z-[100]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 50, 150, 0.5) 0%, rgba(255, 0, 100, 0.25) 50%, rgba(200, 0, 80, 0.15) 100%)',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            filter: 'blur(25px)',
            mixBlendMode: 'screen',
            boxShadow: '0 0 50px rgba(255, 50, 150, 0.3), 0 0 90px rgba(255, 0, 100, 0.2)',
            transform: 'rotate(25deg)',
            zIndex: 100
          }}
        />
        
        {/* Blob 3 - Tím/Xanh dương (Purple/Blue) - Top Right */}
        <div 
          className="absolute top-20 right-1/3 w-[120px] h-[120px] animate-pulse z-[100]"
          style={{
            background: 'radial-gradient(circle, rgba(138, 43, 226, 0.5) 0%, rgba(100, 50, 200, 0.25) 50%, rgba(70, 30, 150, 0.15) 100%)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            filter: 'blur(30px)',
            mixBlendMode: 'screen',
            boxShadow: '0 0 55px rgba(138, 43, 226, 0.35), 0 0 100px rgba(100, 50, 200, 0.25)',
            transform: 'rotate(45deg)',
            animation: 'pulse 3s ease-in-out infinite',
            zIndex: 100
          }}
        />
        
        {/* Blob 4 - Xanh dương (Cyan/Blue) - Top Right Center */}
        <div 
          className="absolute top-32 right-1/4 w-[90px] h-[90px] z-[100]"
          style={{
            background: 'radial-gradient(circle, rgba(0, 200, 255, 0.5) 0%, rgba(0, 150, 200, 0.2) 50%, rgba(0, 100, 150, 0.1) 100%)',
            borderRadius: '40% 60% 60% 40% / 70% 30% 70% 30%',
            filter: 'blur(20px)',
            mixBlendMode: 'screen',
            boxShadow: '0 0 40px rgba(0, 200, 255, 0.3), 0 0 70px rgba(0, 150, 200, 0.2)',
            transform: 'rotate(-30deg)',
            zIndex: 100
          }}
        />
        
        {/* Blob 5 - Tím (Purple) - Bottom Right */}
        <div 
          className="absolute bottom-10 right-10 w-[105px] h-[105px] animate-pulse z-[100]"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, rgba(120, 40, 200, 0.25) 50%, rgba(90, 30, 150, 0.15) 100%)',
            borderRadius: '70% 30% 30% 70% / 60% 40% 60% 40%',
            filter: 'blur(25px)',
            mixBlendMode: 'screen',
            boxShadow: '0 0 50px rgba(147, 51, 234, 0.3), 0 0 90px rgba(120, 40, 200, 0.2)',
            transform: 'rotate(20deg)',
            animation: 'pulse 4.5s ease-in-out infinite',
            zIndex: 100
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* === CỘT TRÁI: NỘI DUNG === */}
          <div className="relative">
            
            {/* Icon Quyển sách bay (Góc trái trên) - Giả lập nếu chưa có ảnh */}
            <div className="absolute -top-12 -left-4 hidden lg:block animate-bounce duration-[3000ms]">
               <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400 w-12 h-12 transform -rotate-12"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>

            <p className="text-sm text-gray-500 font-medium mb-2 uppercase tracking-wide">
              Unlock Your Knowledge Universe:
            </p>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
              Resources & Forums <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-white bg-[#EA454C] px-3 py-1 rounded-xl transform -rotate-2 inline-block shadow-lg">
                  AI Quizz
                </span>
              </span> 
              {' '}For Students
            </h1>

            {/* THANH TÌM KIẾM */}
            <div className="bg-white p-2 rounded-full shadow-xl flex items-center max-w-lg border border-gray-100 mt-8 relative z-10">
              <div className="hidden sm:flex items-center px-4 border-r border-gray-200 cursor-pointer hover:bg-gray-50 h-full rounded-l-full">
                <FiBookOpen className="text-gray-400 mr-2" />
                <span className="text-sm text-gray-700 font-medium">Category</span>
                <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search Documents, Forums Topic and Course" 
                className="flex-1 px-5 py-3 text-sm text-gray-700 focus:outline-none bg-transparent placeholder-gray-400" 
              />
              <button className="bg-[#2D2B4A] text-white px-8 py-3 rounded-full hover:bg-[#3f3c61] transition duration-300 font-semibold text-sm">
                Search
              </button>
            </div>

            {/* Trusted Text */}
            <div className="mt-10 flex flex-col space-y-2">
               <p className="text-sm text-gray-600 font-medium">
                 Trusted by over <span className="font-bold text-gray-900">15K Students</span> & Educators worldwide since 2024
               </p>
               <div className="flex items-center text-yellow-400 text-sm">
                 ★★★★★ <span className="text-gray-400 ml-2 text-xs">4.9 / 200 Review</span>
               </div>
            </div>

            {/* Hình lò xo đỏ (decorVector) - Bay ở góc trái dưới */}
            <img 
              src={decorVector} 
              alt="Decoration" 
              className="absolute -bottom-10 -left-10 w-16 animate-pulse pointer-events-none"
            />
          </div>

          {/* === CỘT PHẢI: ẢNH & BACKGROUND SHAPES === */}
          <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0 h-[500px]">
            
            {/* LỚP 1: HÌNH NỀN (Tuyệt đối phía sau) */}
            <div className="absolute top-0 right-0 w-full h-full flex justify-end items-center pointer-events-none -z-10">
                {/* Hình tím đậm */}
                <img 
                    src={purpleVector} 
                    alt="" 
                    className="absolute right-[20%] top-[20%] w-0.6 h-80 object-contain transform -translate-x-10 translate-y-10 -z-30"
                />
                {/* Hình vàng lớn */}
                <img 
                    src={backgroundShape} 
                    alt="" 
                    className="absolute right-0 top-0 w-[50%] h-auto object-contain -z-10" 
                />
                <img
                src={backgroundShape}
                alt=""
                className="absolute right-40 top-40 w-[40%] h-auto object-contain -z-20" 
                />
            </div>

            {/* LỚP 2: CÔ GÁI (Chính) */}
            <img 
              src={girlShape} 
              alt="Happy Student" 
              className="relative z-10 h-full object-contain drop-shadow-xl right-10 bottom-10"
              style={{ zIndex: 10 }}
            />

            {/* LỚP 3: THẺ NỔI (Floating Cards) */}
            
            {/* Card 1: 35K+ Students Enrolled (Góc trái trên cô gái) */}
            <div className="absolute top-20 left-0 lg:left-10 bg-white p-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-10 animate-bounce" style={{ animationDuration: '4s', zIndex: 10 }}>
                <div className="flex items-center space-x-[-10px] mb-2 justify-center">
                    {/* Mock Avatars */}
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" />
                        </div>
                    ))}
                </div>
                <p className="text-center text-xs font-bold text-gray-800">
                    <span className="text-red-500">35K+</span> Students Enrolled
                </p>
            </div>

            {/* Card 2: 50+ Majors (Góc phải cô gái) */}
            <div className="absolute top-1/3 right-0 bg-[#2D2B4A] text-white p-3 rounded-xl shadow-xl z-10 transform translate-x-4" style={{ zIndex: 10 }}>
               <div className="flex items-center gap-3">
                  <div className="bg-[#EA454C] p-2 rounded-full shadow-sm">
                    <FiBookOpen className="text-white w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-lg leading-none">50+</div>
                    <div className="text-[10px] text-gray-300 uppercase">Majors</div>
                  </div>
               </div>
            </div>

            {/* Icon trang trí thêm (Tia sét, Zigzag...) */}
            <div className="absolute top-10 right-10 text-orange-500 text-4xl animate-pulse z-10" style={{ zIndex: 10 }}>⚡</div>
            <div className="absolute bottom-1/3 left-10 text-purple-500 text-4xl font-bold transform rotate-12 z-10" style={{ zIndex: 10 }}>〰️</div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;