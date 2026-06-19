import React from 'react';
import { FaCheckCircle } from 'react-icons/fa'; 
import { FiBookOpen } from 'react-icons/fi';
import Button from '../Button'; 


const img1 = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"; // Ảnh dọc
const img2 = "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"; // Ảnh ngang trên
const img3 = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"; // Ảnh ngang dưới

const features = [
  "Generate Quizzes in Seconds",
  "Targeted Quizzing on Specific Topics",
  "Instantly Identify Knowledge Gaps",
  "Infinite, Unique Quiz Variations",
  "Rapid Test Drafts for Educators"
];

function AiFeatureSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* === CỘT TRÁI: COLLAGE ẢNH (Ghép ảnh) === */}
          <div className="relative">
            
            {/* Grid ảnh: 2 cột, khoảng cách nhỏ */}
            <div className="grid grid-cols-2 gap-4">
               {/* Ảnh 1: Cao, chiếm 2 hàng (row-span-2) */}
               <div className="row-span-2 relative group overflow-hidden rounded-2xl">
                  <img src={img1} alt="Student" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
               </div>
               
               {/* Ảnh 2 */}
               <div className="h-48 relative group overflow-hidden rounded-2xl">
                  <img src={img2} alt="Student" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
               </div>

               {/* Ảnh 3 */}
               <div className="h-48 relative group overflow-hidden rounded-2xl">
                  <img src={img3} alt="Student" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
               </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FFC107] w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white z-10 animate-bounce-slow">
               <FiBookOpen className="text-white text-3xl" />
            </div>

          </div>


          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered Learning: <br />
              Generate Quizzes in <br />
              <span className="text-[#EA454C]">3 Simple Steps</span>
            </h2>
            
            <p className="text-gray-500 mb-8 text-lg">
              Convert any PDF lecture note or study material into instant, self-assessment tests tailored to your curriculum.
            </p>

            {/* Danh sách tính năng (Checklist) */}
            <ul className="space-y-4 mb-10">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-gray-700 font-medium">
                  {/* Icon tích xanh */}
                  <FaCheckCircle className="text-[#00CBB8] mr-3 text-xl flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button variant="primary" size="lg">
              Get Started &gt;
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}

export default AiFeatureSection;