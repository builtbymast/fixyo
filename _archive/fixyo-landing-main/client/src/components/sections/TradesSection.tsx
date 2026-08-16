/* FixYo Trades Section — Warm Modernism
 * Showcases the 11 supported trade categories
 * Uses trades collage image + trade cards grid
 */
import { useRef, useEffect } from "react";

const trades = [
  { name: "Plumbers", icon: "🔧", desc: "Pipe work, hot water, drainage" },
  { name: "Electricians", icon: "⚡", desc: "Wiring, switchboards, solar" },
  { name: "Carpenters", icon: "🪚", desc: "Framing, decking, fit-out" },
  { name: "Tilers", icon: "🏠", desc: "Floor, wall, and outdoor tiling" },
  { name: "Roofers", icon: "🏗️", desc: "Colorbond, tiles, guttering" },
  { name: "HVAC Techs", icon: "❄️", desc: "Air con, heating, ventilation" },
  { name: "Concreters", icon: "🧱", desc: "Slabs, driveways, paths" },
  { name: "Gas Fitters", icon: "🔥", desc: "Gas lines, appliances, BBQs" },
  { name: "Plasterers", icon: "🎨", desc: "Render, plasterboard, cornice" },
  { name: "Landscapers", icon: "🌿", desc: "Gardens, retaining walls, turf" },
  { name: "Painters", icon: "🖌️", desc: "Interior, exterior, commercial" },
];

export default function TradesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const elements = sectionRef.current?.querySelectorAll(".fade-up");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="trades" className="py-24 bg-[#FAFAF7]" ref={sectionRef}>
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image */}
          <div className="fade-up order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-200/40 to-[#1B2B4B]/10 rounded-3xl blur-2xl" />
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663486083546/D3Dtr5qP9UpRfB5okW7STw/fixyo-trades-collage-3mbazB6L9rLmKKUuSqbVz4.webp"
                alt="Australian tradespeople — plumber, electrician, carpenter, tiler, roofer, HVAC technician"
                className="relative w-full rounded-2xl shadow-2xl shadow-[#1B2B4B]/15"
              />
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <div className="fade-up mb-8">
              <span className="inline-block text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">
                11 Trade Categories
              </span>
              <h2 className="font-['Sora'] font-extrabold text-3xl sm:text-4xl text-[#1B2B4B] mb-4">
                Whatever Your Trade,{" "}
                <span className="text-amber-500">FixYo Has You Covered</span>
              </h2>
              <p className="text-[#64748B] leading-relaxed">
                FixYo is built for the full spectrum of Australian trades. Each category comes with industry-specific pricing data, trade-relevant sub-categories, and tailored AI prompt templates.
              </p>
            </div>

            {/* Trades Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trades.map((trade, i) => (
                <div
                  key={trade.name}
                  className="fade-up flex items-center gap-3 bg-white rounded-xl p-3.5 border border-[#1B2B4B]/8 hover:border-amber-300 hover:shadow-md transition-all duration-200"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-xl shrink-0">
                    {trade.icon}
                  </div>
                  <div>
                    <div className="font-['Sora'] font-semibold text-sm text-[#1B2B4B]">{trade.name}</div>
                    <div className="text-xs text-[#64748B]">{trade.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing note */}
            <div className="fade-up mt-6 bg-[#1B2B4B] rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">$</span>
              </div>
              <div>
                <div className="font-['Sora'] font-semibold text-white text-sm mb-1">
                  Industry-Standard 2025-26 Australian Rates
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                  Real hourly rates, call-out fees, and material pricing from national databases. References real Australian brands: Caroma, Clipsal, Dulux, Daikin, Rinnai, Monier, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
