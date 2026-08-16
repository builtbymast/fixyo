/* FixYo Home Page — Warm Modernism
 * Design: Navy (#1B2B4B) + Cream (#FAFAF7) + Amber (#F59E0B)
 * Sections: Hero → Stats → Features → How It Works → Trades → Pricing → Testimonials → FAQ → CTA
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import StatsSection from "@/components/sections/StatsSection";
import TrustBarSection from "@/components/sections/TrustBarSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import TradesSection from "@/components/sections/TradesSection";
import PricingSection from "@/components/sections/PricingSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FaqSection from "@/components/sections/FaqSection";
import CtaSection from "@/components/sections/CtaSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <TrustBarSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TradesSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
