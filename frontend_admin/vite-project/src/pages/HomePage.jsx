import React from "react";
import HeroSection from '../components/home/HeroSection';
import DisciplinesSection from '../components/home/DisciplinesSection';
import BenefitsSection from "../components/home/BenefitsSection";
import FeaturedResources from "../components/home/FeaturedResources";
import StatsSection from "../components/home/statsSection";
import TrendingContributors from '../components/home/TrendingContributors';
import NewsletterSection from '../components/home/NewsletterSection';
import AiFeatureSection from '../components/home/AiFeatureSection';
import TestimonialsSection from "../components/home/TestimonialsSection";
import ContributorCTASection from "../components/home/ContributorCTASection";
import BlogSection from "../components/home/BlogSection";
import Footer from "../components/home/Footer";
import Header from "../components/Header";
function HomePage(){
    return (
        <div className="min-h-screen font-sans">
            <Header/>
            <HeroSection/>
            <DisciplinesSection />
            <BenefitsSection />
            <FeaturedResources/>
            <StatsSection/>
            <TrendingContributors/>
            
            <NewsletterSection/>
            <AiFeatureSection/>
            <TestimonialsSection/>
            <ContributorCTASection/>

            <BlogSection/>
            <Footer/>
        </div>
    );
}

export default HomePage;