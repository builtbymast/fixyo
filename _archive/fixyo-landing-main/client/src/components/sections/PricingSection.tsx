/* FixYo Pricing Section — Warm Modernism
 * 3-column pricing cards: Free, Pro, Enterprise
 * Pro card highlighted in navy
 *
 * ACTION REQUIRED before go-live:
 *   Replace APP_URL and CONTACT_EMAIL below with your real values.
 */
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";

/* ─── Replace with your real app URL and contact email ─── */
const APP_URL = "https://fixyo.ai";
const CONTACT_EMAIL = "sales@fixyo.ai";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Perfect for sole traders just getting started.",
    highlight: false,
    badge: null,
    features: [
      { text: "Up to 5 active jobs", included: true },
      { text: "Basic quoting & invoicing", included: true },
      { text: "Customer portal access", included: true },
      { text: "Job photos (10 per job)", included: true },
      { text: "Email document sending", included: true },
      { text: "Price estimator (read-only)", included: true },
      { text: "AI Prompt Generator", included: false },
      { text: "Daily job reports", included: false },
      { text: "Unlimited jobs", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    ctaAction: () => window.open(`${APP_URL}/signup`, "_blank"),
  },
  {
    name: "Pro",
    price: { monthly: 49, annual: 39 },
    description: "For growing trade businesses that need the full toolkit.",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited active jobs", included: true },
      { text: "Full quoting & invoicing", included: true },
      { text: "Customer portal access", included: true },
      { text: "Unlimited job photos", included: true },
      { text: "Email document sending", included: true },
      { text: "Price estimator + custom rates", included: true },
      { text: "AI Prompt Generator (500 credits/mo)", included: true },
      { text: "Daily job reports + PDF export", included: true },
      { text: "Digital signature capture", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start 14-Day Free Trial",
    ctaVariant: "default" as const,
    ctaAction: () => window.open(`${APP_URL}/signup?plan=pro`, "_blank"),
  },
  {
    name: "Enterprise",
    price: { monthly: null, annual: null },
    description: "For large trade businesses and multi-crew operations.",
    highlight: false,
    badge: "Custom",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Multiple user accounts", included: true },
      { text: "Custom branding", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom integrations", included: true },
      { text: "SLA support", included: true },
      { text: "Bulk job import", included: true },
      { text: "Custom AI credit limits", included: true },
      { text: "White-label portal", included: true },
      { text: "Custom contract templates", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    ctaAction: () => { window.location.href = `mailto:${CONTACT_EMAIL}?subject=FixYo Enterprise Enquiry`; },
  },
];

export default function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [annual, setAnnual] = useState(false);

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
    <section id="pricing" className="py-24 bg-white" ref={sectionRef}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12 fade-up">
          <span className="inline-block text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Simple Pricing
          </span>
          <h2 className="font-['Sora'] font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B2B4B] mb-4">
            Transparent Pricing, No Surprises
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Start free, upgrade when you're ready. No lock-in contracts, no hidden fees.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-[#FAFAF7] rounded-xl p-1.5 border border-[#1B2B4B]/10">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                !annual ? "bg-white shadow-sm text-[#1B2B4B]" : "text-[#64748B]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                annual ? "bg-white shadow-sm text-[#1B2B4B]" : "text-[#64748B]"
              }`}
            >
              Annual
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`fade-up rounded-2xl border p-7 relative ${
                plan.highlight
                  ? "bg-[#1B2B4B] border-[#1B2B4B] shadow-2xl shadow-[#1B2B4B]/25 scale-105"
                  : "bg-white border-[#1B2B4B]/10"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                    plan.highlight
                      ? "bg-amber-500 text-white"
                      : "bg-[#1B2B4B]/10 text-[#1B2B4B]"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <div
                className={`font-['Sora'] font-bold text-sm uppercase tracking-widest mb-2 ${
                  plan.highlight ? "text-amber-400" : "text-amber-600"
                }`}
              >
                {plan.name}
              </div>

              {/* Price */}
              <div className="mb-3">
                {plan.price.monthly !== null ? (
                  <div className="flex items-end gap-1">
                    <span
                      className={`font-['Sora'] font-extrabold text-5xl ${
                        plan.highlight ? "text-white" : "text-[#1B2B4B]"
                      }`}
                    >
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span
                      className={`text-sm mb-2 ${
                        plan.highlight ? "text-white/50" : "text-[#64748B]"
                      }`}
                    >
                      /mo
                    </span>
                  </div>
                ) : (
                  <div
                    className={`font-['Sora'] font-extrabold text-4xl ${
                      plan.highlight ? "text-white" : "text-[#1B2B4B]"
                    }`}
                  >
                    Custom
                  </div>
                )}
              </div>

              <p
                className={`text-sm leading-relaxed mb-6 ${
                  plan.highlight ? "text-white/60" : "text-[#64748B]"
                }`}
              >
                {plan.description}
              </p>

              {/* CTA */}
              <Button
                variant={plan.highlight ? "default" : plan.ctaVariant}
                className={`w-full mb-7 font-semibold rounded-xl ${
                  plan.highlight
                    ? "bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg shadow-amber-500/30"
                    : plan.ctaVariant === "outline"
                    ? "border-[#1B2B4B]/20 text-[#1B2B4B] hover:bg-[#1B2B4B]/5"
                    : ""
                }`}
                onClick={plan.ctaAction}
              >
                {plan.cta}
              </Button>

              {/* Features */}
              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2.5">
                    {feature.included ? (
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          plan.highlight ? "text-amber-400" : "text-emerald-500"
                        }`}
                      />
                    ) : (
                      <X className="w-4 h-4 mt-0.5 shrink-0 text-[#64748B]/40" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? plan.highlight
                            ? "text-white/80"
                            : "text-[#1B2B4B]"
                          : "text-[#64748B]/50"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* GST note */}
        <p className="text-center text-xs text-[#64748B] mt-8 fade-up">
          All prices in AUD and exclude GST. Pro plan billed monthly or annually.
        </p>
      </div>
    </section>
  );
}
