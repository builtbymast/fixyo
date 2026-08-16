/* FixYo Testimonials Section — Warm Modernism
 * Horizontal scroll strip of testimonial cards
 * Warm cream background with navy cards
 */
import { useRef, useEffect } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dave Kowalski",
    trade: "Plumber",
    location: "Sydney, NSW",
    avatar: "DK",
    rating: 5,
    text: "I used to spend Sunday nights doing quotes on Excel. Now I knock them out in 10 minutes on FixYo and send them straight from my phone. Game changer.",
  },
  {
    name: "Sarah Chen",
    trade: "Electrician",
    location: "Melbourne, VIC",
    avatar: "SC",
    rating: 5,
    text: "The customer portal is brilliant. My clients can sign the work authorisation and pay the invoice without me having to chase them. Gets paid faster every time.",
  },
  {
    name: "Mick Thornton",
    trade: "Carpenter",
    location: "Brisbane, QLD",
    avatar: "MT",
    rating: 5,
    text: "The price estimator is spot on for Queensland rates. I used to underquote all the time — now I benchmark against the industry rates and my margins have improved significantly.",
  },
  {
    name: "Jas Patel",
    trade: "Tiler",
    location: "Perth, WA",
    avatar: "JP",
    rating: 5,
    text: "Daily job reports with PDF export is something I didn't know I needed. Now I send them to builders at the end of each day and they love the professionalism.",
  },
  {
    name: "Tony Russo",
    trade: "HVAC Technician",
    location: "Adelaide, SA",
    avatar: "TR",
    rating: 5,
    text: "The AI prompt generator saves me hours on follow-up emails and review requests. I'm getting more Google reviews than ever because the messages actually sound like me.",
  },
  {
    name: "Ben Walsh",
    trade: "Roofer",
    location: "Gold Coast, QLD",
    avatar: "BW",
    rating: 5,
    text: "Finally a platform that understands trades. The financial year job numbering, the GST toggle, the ABN on invoices — it's all just there. No fiddling around.",
  },
];

export default function TestimonialsSection() {
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
    <section className="py-24 bg-[#FAFAF7] overflow-hidden" ref={sectionRef}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12 fade-up">
          <span className="inline-block text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Trusted by Tradies
          </span>
          <h2 className="font-['Sora'] font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B2B4B] mb-4">
            What Australian Tradies Are Saying
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-[#64748B] text-sm font-medium">4.9/5 from 200+ reviews</span>
          </div>
        </div>
      </div>

      {/* Scrollable testimonials */}
      <div className="relative">
        <div className="flex gap-5 overflow-x-auto pb-4 px-4 sm:px-8 lg:px-16 snap-x snap-mandatory scrollbar-hide">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="fade-up shrink-0 w-80 sm:w-96 bg-white rounded-2xl border border-[#1B2B4B]/8 p-6 snap-start"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#1B2B4B] text-sm leading-relaxed mb-5 italic">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1B2B4B] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{t.avatar}</span>
                </div>
                <div>
                  <div className="font-['Sora'] font-semibold text-sm text-[#1B2B4B]">{t.name}</div>
                  <div className="text-xs text-[#64748B]">
                    {t.trade} · {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fade edges */}
        <div className="absolute top-0 left-0 bottom-4 w-16 bg-gradient-to-r from-[#FAFAF7] to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-4 w-16 bg-gradient-to-l from-[#FAFAF7] to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
