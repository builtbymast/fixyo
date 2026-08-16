/* FixYo CTA Section — Warm Modernism
 * Full-width navy section with hero image background
 * Strong CTA to start free trial
 *
 * ACTION REQUIRED before go-live:
 *   Replace APP_URL below with your real app domain.
 */
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

/* ─── Replace with your real app URL ─── */
const APP_URL = "https://fixyo.ai";

export default function CtaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.2 }
    );
    const elements = sectionRef.current?.querySelectorAll(".fade-up");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-0 overflow-hidden" ref={sectionRef}>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663486083546/D3Dtr5qP9UpRfB5okW7STw/fixyo-hero-bg-AzQfhHoBuYfoDmX7yXhmwr.webp)`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#1B2B4B]/80" />
      {/* Amber gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1B2B4B]/90 via-[#1B2B4B]/70 to-transparent" />

      <div className="relative z-10 container py-24 lg:py-32">
        <div className="max-w-2xl">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/30 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Start Today — No Credit Card Required
            </span>
          </div>

          <h2 className="fade-up font-['Sora'] font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-6" style={{ transitionDelay: "100ms" }}>
            Stop Losing Money on{" "}
            <span className="text-amber-400">Admin Work.</span>
          </h2>

          <p className="fade-up text-white/70 text-lg leading-relaxed mb-8" style={{ transitionDelay: "200ms" }}>
            Join thousands of Australian tradies who are quoting faster, invoicing smarter, and getting paid on time with FixYo. Your first 14 days are completely free.
          </p>

          <div className="fade-up flex flex-col sm:flex-row gap-4 mb-8" style={{ transitionDelay: "300ms" }}>
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 rounded-xl shadow-xl shadow-amber-500/30 group"
              onClick={() => window.open(`${APP_URL}/signup`, "_blank")}
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold px-8 rounded-xl"
              onClick={() => {
                document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              View Pricing
            </Button>
          </div>

          <div className="fade-up flex flex-wrap gap-5" style={{ transitionDelay: "400ms" }}>
            {[
              "Free 14-day trial",
              "No credit card required",
              "Cancel anytime",
              "Australian-built & supported",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
