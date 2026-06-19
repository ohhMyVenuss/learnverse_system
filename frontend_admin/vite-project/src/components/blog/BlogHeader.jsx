import React from 'react';

/**
 * Header section của BlogPage
 * Hiển thị title và description
 */
const BlogHeader = () => {
  return (
    <section className="bg-gradient-to-br from-[#FFF7F7] via-white to-[#F0F5FF] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Learnverse Community
        </p>
        <div className="mt-6">
          <h1 className="text-4xl font-semibold text-gray-900 md:text-5xl">
            Blog & Discussion Hub <span className="text-[#EA454C]">.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Share insights, ask thoughtful questions, and highlight the strongest answers from
            Admin, Instructor, and Student voices.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlogHeader;

