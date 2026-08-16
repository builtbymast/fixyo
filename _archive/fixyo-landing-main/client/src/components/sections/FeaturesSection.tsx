/* FixYo Features Section — Warm Modernism
 * Grid of feature cards with icon, title, description
 * Alternating highlight card in navy
 */
import { useRef, useEffect } from "react";
import {
  Briefcase, FileText, Mail, Users, ClipboardList,
  Camera, Calculator, Bot, UserCheck, Settings,
  CreditCard, Zap
} from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Job Management",
    description: "Create and track jobs through a standardised workflow: Draft → Active → Completed → Invoiced → Paid. Unique Australian financial year reference numbers (e.g. FY2526-03-001).",
    highlight: false,
  },
  {
    icon: FileText,
    title: "Quoting & Invoicing",
    description: "Track labour hours, hourly rates, and itemised materials. Automatic GST calculations (toggle on/off). Professional documents ready in minutes.",
    highlight: true,
  },
  {
    icon: Mail,
    title: "Document Generation & Email",
    description: "Generate Quotes, Invoices, Contracts, and Work Authorisations. Send directly to customers, capture digital signatures, and track document status.",
    highlight: false,
  },
  {
    icon: Users,
    title: "Customer Portal",
    description: "Secure token-based portal access for customers. They can view job details, sign contracts, and pay invoices — all without creating an account.",
    highlight: false,
  },
  {
    icon: ClipboardList,
    title: "Daily Job Reports",
    description: "Create daily site reports linked to jobs. Track labour hours, staff on-site, materials used, and foreman notes. Export to PDF instantly.",
    highlight: false,
  },
  {
    icon: Camera,
    title: "Job Photos",
    description: "Upload multiple photos per job with captions. Before/after/general photo types with a responsive lightbox viewer. Cloud storage included.",
    highlight: false,
  },
  {
    icon: Calculator,
    title: "Price Estimator",
    description: "Industry-standard 2025-2026 Australian trade rates across 11 categories. Real hourly rates, call-out fees, and material pricing from national databases.",
    highlight: true,
  },
  {
    icon: Bot,
    title: "AI Prompt Generator",
    description: "Generate professional communications: quotes, follow-ups, review requests, and social media posts. Trade-specific templates with AI optimisation.",
    highlight: false,
  },
  {
    icon: UserCheck,
    title: "Customer Auto-Suggest",
    description: "Auto-complete customer details from previous jobs. Speeds up repeat customer job creation so you spend less time on admin.",
    highlight: false,
  },
  {
    icon: Settings,
    title: "Business Profile",
    description: "Store your business name, ABN, bank details (BSB, account number), and display preferences. Everything appears correctly on your documents.",
    highlight: false,
  },
  {
    icon: CreditCard,
    title: "Subscription & Billing",
    description: "Tiered plans: Free and Pro via Stripe. Monthly credit system with usage tracking. Promo code redemption with expiry and usage limits.",
    highlight: false,
  },
  {
    icon: Zap,
    title: "Onboarding Wizard",
    description: "Guided setup for new users. Collects your business details and trade preferences so FixYo is personalised from day one.",
    highlight: false,
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const elements = sectionRef.current?.querySelectorAll(".fade-up");
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-24 bg-[#FAFAF7]" ref={sectionRef}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16 fade-up">
          <span className="inline-block text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Everything You Need
          </span>
          <h2 className="font-['Sora'] font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B2B4B] mb-4">
            Built for the Way You Work
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto leading-relaxed">
            Every feature in FixYo was designed with Australian tradespeople in mind. No bloat, no complexity — just the tools you actually need on the job.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`fade-up rounded-2xl p-6 border transition-all duration-300 fixyo-card-hover ${
                  feature.highlight
                    ? "bg-[#1B2B4B] border-[#1B2B4B] text-white"
                    : "bg-white border-[#1B2B4B]/8 text-[#1B2B4B]"
                }`}
                style={{ transitionDelay: `${(i % 6) * 60}ms` }}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                    feature.highlight ? "bg-amber-500" : "bg-[#1B2B4B]/8"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${feature.highlight ? "text-white" : "text-[#1B2B4B]"}`}
                    strokeWidth={2}
                  />
                </div>
                <h3
                  className={`font-['Sora'] font-bold text-lg mb-2 ${
                    feature.highlight ? "text-white" : "text-[#1B2B4B]"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    feature.highlight ? "text-white/70" : "text-[#64748B]"
                  }`}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
