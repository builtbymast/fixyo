/* FixYo FAQ Section — Warm Modernism
 * Accordion-style FAQ with navy/amber accents
 */
import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is FixYo only for Australian tradespeople?",
    a: "Yes — FixYo is purpose-built for Australian trades. It includes Australian financial year job numbering, GST calculations, ABN fields on documents, and industry-standard 2025-26 pricing from national Australian databases. It references real Australian brands like Caroma, Clipsal, Dulux, Daikin, and Rinnai.",
  },
  {
    q: "Do I need to set up any software or hardware?",
    a: "No. FixYo is entirely cloud-based. You access it through your web browser on any device — phone, tablet, or desktop. Nothing to install, nothing to configure. Sign up and you're ready to create your first job.",
  },
  {
    q: "How does the customer portal work?",
    a: "When you send a quote, invoice, or contract to a customer, they receive a secure link via email. This link opens a customer portal where they can view the document, digitally sign it (for contracts and work authorisations), and pay invoices — all without creating an account. Access is token-based and expires after use.",
  },
  {
    q: "Can my customers pay online?",
    a: "Yes. Customers can pay invoices directly through the customer portal. Payments are processed securely via Stripe. You'll see the payment reflected in your job status immediately.",
  },
  {
    q: "What is the Price Estimator?",
    a: "The Price Estimator gives you access to industry-standard 2025-26 Australian trade rates across 11 categories. It includes real hourly rates, call-out fees, and material pricing. Once you log your own pricing in FixYo, your personal averages override the industry defaults, so your estimates become more accurate over time.",
  },
  {
    q: "What is the AI Prompt Generator?",
    a: "The AI Prompt Generator helps you create professional communications: quotes, follow-up messages, review requests, and social media posts. You select a template, customise it for your trade, and the AI optimises it for clarity and professionalism. Available on the Pro plan with 500 credits per month.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. FixYo uses Row-Level Security (RLS) on all database tables — meaning you can only ever access your own data. Customer portal access is token-based with JWT validation. All data is stored in Australian-region infrastructure via Supabase.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes. You can cancel your Pro subscription at any time from your account settings. You'll retain access until the end of your current billing period, then revert to the Free plan. No lock-in contracts, no cancellation fees.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data remains accessible on the Free plan. You can export your jobs, quotes, and documents at any time. We don't delete your data when you downgrade.",
  },
  {
    q: "Does FixYo work on mobile?",
    a: "Yes. FixYo is fully responsive and designed to work on any device. Many tradies use it on their phone or tablet on-site to create jobs, take photos, and send quotes while they're still with the customer.",
  },
];

export default function FaqSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
    <section id="faq" className="py-24 bg-white" ref={sectionRef}>
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Header */}
          <div className="fade-up">
            <span className="inline-block text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">
              FAQ
            </span>
            <h2 className="font-['Sora'] font-extrabold text-3xl sm:text-4xl text-[#1B2B4B] mb-4">
              Common Questions
            </h2>
            <p className="text-[#64748B] leading-relaxed mb-6">
              Can't find what you're looking for? Reach out to our support team.
            </p>
            <a
              href="mailto:support@fixyo.ai"
              className="inline-flex items-center gap-2 text-amber-600 font-semibold text-sm hover:text-amber-700 transition-colors"
            >
              support@fixyo.ai →
            </a>
          </div>

          {/* Right: Accordion */}
          <div className="lg:col-span-2 fade-up" style={{ transitionDelay: "100ms" }}>
            <div className="flex flex-col divide-y divide-[#1B2B4B]/8">
              {faqs.map((faq, i) => (
                <div key={i} className="py-4">
                  <button
                    className="w-full flex items-start justify-between gap-4 text-left group"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    <span
                      className={`font-['Sora'] font-semibold text-sm leading-snug transition-colors ${
                        openIndex === i ? "text-amber-600" : "text-[#1B2B4B] group-hover:text-amber-600"
                      }`}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 mt-0.5 transition-transform text-[#64748B] ${
                        openIndex === i ? "rotate-180 text-amber-500" : ""
                      }`}
                    />
                  </button>
                  {openIndex === i && (
                    <p className="mt-3 text-sm text-[#64748B] leading-relaxed pr-8">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
