import React from 'react';

import { FaChalkboardTeacher, FaAward, FaUserFriends } from 'react-icons/fa';


const benefits = [
  {
    id: 1,
    title: "Access the Curated Knowledge Vault",
    description: "Easily find, share, and organize verified study materials, lecture notes, and test banks contributed by the academic community.",
    icon: <FaChalkboardTeacher />,
    highlight: false, // Item thường
  },
  {
    id: 2,
    title: "Master Concepts with AI Tools",
    description: "Convert complex PDFs into instant, personalized multiple-choice quizzes to test retention and identify knowledge gaps quickly.",
    icon: <FaAward />, // Dùng icon huy chương/ngôi sao
    highlight: true, // Item ĐẶC BIỆT (Màu đỏ)
  },
  {
    id: 3,
    title: "Connect and Advance with Peers",
    description: "Engage in active, subject-specific forums to ask questions, debate concepts, and find collaborators for projects and thesis work.",
    icon: <FaUserFriends />, 
    highlight: false, // Item thường
  },
];

function BenefitsSection() {
  return (
    <section className="py-20 bg-[#0f172a] text-white relative overflow-hidden">
      
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-[#0f172a] to-[#0f172a]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-4 rounded-full bg-gray-800 text-gray-300 text-xs font-bold uppercase tracking-wider mb-4 border border-gray-700">
            Our Benefits
          </span>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Go Beyond Textbooks: Learn, Share, and Discover
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
            Our platform equips you with the tools and community support needed to excel in your major and academic career.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {benefits.map((item) => (
            <div key={item.id} className="flex flex-col items-center text-center group">
              
              <div 
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-6 transition-all duration-300
                  ${item.highlight 
                    ? 'bg-[#EA454C] text-white shadow-[0_0_20px_rgba(234,69,76,0.4)] scale-110' // Style cho item giữa
                    : 'bg-gray-800 text-gray-300 group-hover:bg-gray-700' // Style cho item thường
                  }
                `}
              >
                {item.icon}
              </div>

              <h3 className="text-xl font-bold mb-3 text-white">
                {item.title}
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default BenefitsSection;