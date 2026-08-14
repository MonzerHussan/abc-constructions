"use client";

import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import { ServicesSection, WhyUsSection, ProjectsSection } from "@/components/landing/LandingSections";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingFrame() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <main>
        <HeroSection />
        <ServicesSection />
        <WhyUsSection />
        <ProjectsSection />
      </main>
      <LandingFooter />
    </div>
  );
}