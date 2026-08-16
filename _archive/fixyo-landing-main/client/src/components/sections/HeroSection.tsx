/* FixYo Hero Section — Warm Modernism
 * Asymmetric layout: text left, dashboard mockup right
 * Video demo removed — ready for real CTA links
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const trustBadges = [
  "No credit card required",
  "Free 14-day trial",
  "Cancel anytime",
];

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FAFAF7] dot-grid-bg pt-16">
      {/* Warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAF7] via-[#FAFAF7]/95 to-amber-50/40 pointer-events-none" />

      <div className="container relative z-10 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: Text Content ── */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className={`transition-all duration-500 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Built for Australian Tradespeople
              </span>
            </div>

            {/* Headline */}
            <div className={`transition-all duration-500 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <h1 className="font-['Sora'] font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#1B2B4B]">
                Quote. Invoice.{" "}
                <span className="relative inline-block">
                  <span className="text-amber-500">Get Paid.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C40 2 80 1 100 1C120 1 160 2 198 6" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <h2 className="font-['Sora'] font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#1B2B4B] mt-2">
                All in One Place.
              </h2>
            </div>

            {/* Subtext */}
            <p className={`text-[#64748B] text-lg leading-relaxed max-w-lg transition-all duration-500 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              FixYo is the job management platform built exclusively for Australian trades. Create quotes in minutes, send professional invoices, capture digital signatures, and track every job from first call to final payment.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-3 transition-all duration-500 delay-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <Button
                size="lg"
                className="bg-[#1B2B4B] hover:bg-[#243a63] text-white font-semibold px-7 rounded-xl shadow-lg shadow-[#1B2B4B]/20 group"
                onClick={() => window.open("https://fixyo.ai/signup", "_blank")}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-[#1B2B4B]/20 text-[#1B2B4B] hover:bg-[#1B2B4B]/5 font-semibold px-7 rounded-xl"
                onClick={() => {
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                View Pricing
              </Button>
            </div>

            {/* Trust Badges */}
            <div className={`flex flex-wrap gap-4 transition-all duration-500 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {trustBadges.map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-sm text-[#64748B]">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Dashboard Mockup ── */}
          <div className={`relative transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-200/30 to-[#1B2B4B]/10 rounded-3xl blur-2xl pointer-events-none" />

            {/* Dashboard mockup */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#1B2B4B]/20 border border-white/60">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663486083546/D3Dtr5qP9UpRfB5okW7STw/fixyo-dashboard-mockup-nBJ4FX5G9PD5HQdzrSYZYd.webp"
                alt="FixYo job management dashboard"
                className="w-full h-auto"
              />
            </div>

            {/* Floating stat cards */}
            <div className="absolute -left-6 top-[30%] bg-white rounded-xl shadow-lg shadow-[#1B2B4B]/10 p-3 border border-[#1B2B4B]/5 z-10">
              <div className="text-xs text-[#64748B] font-medium mb-1">This Month</div>
              <div className="font-['Sora'] font-bold text-xl text-[#1B2B4B]">$24,850</div>
              <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <span>↑ 18%</span>
                <span className="text-[#64748B]">vs last month</span>
              </div>
            </div>

            <div className="absolute -right-4 top-[55%] bg-[#1B2B4B] rounded-xl shadow-lg p-3 z-10">
              <div className="text-xs text-white/60 font-medium mb-1">Jobs Active</div>
              <div className="font-['Sora'] font-bold text-xl text-white">12</div>
              <div className="text-xs text-amber-400 font-medium mt-0.5">3 need invoicing</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAFAF7] to-transparent pointer-events-none z-10" />
    </section>
  );
}
