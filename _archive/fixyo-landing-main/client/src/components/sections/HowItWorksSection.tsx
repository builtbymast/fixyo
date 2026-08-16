/* FixYo How It Works Section — Warm Modernism
 * Step-by-step workflow with alternating image/text layout
 */
import { useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create a Job",
    description: "Add a new job in seconds. Enter customer details, select your trade, add a description and notes. FixYo automatically assigns a unique Australian financial year reference number.",
    detail: "Customer auto-suggest fills in repeat clients instantly.",
    color: "bg-amber-50 border-amber-200",
    numberColor: "text-amber-500",
  },
  {
    number: "02",
    title: "Build Your Quote",
    description: "Add labour hours, your hourly rate, and an itemised materials list. FixYo calculates totals and GST automatically. Use the Price Estimator to benchmark against industry-standard Australian rates.",
    detail: "2025-26 national trade rates built right in.",
    color: "bg-blue-50 border-blue-200",
    numberColor: "text-[#1B2B4B]",
  },
  {
    number: "03",
    title: "Send & Get Signed",
    description: "Generate a professional quote or contract and send it directly to your customer via email. They access a secure customer portal to review, digitally sign, and approve — no account needed.",
    detail: "Digital signature capture, timestamped and stored.",
    color: "bg-emerald-50 border-emerald-200",
    numberColor: "text-emerald-600",
  },
  {
    number: "04",
    title: "Invoice & Get Paid",
    description: "Convert your completed job to an invoice in one click. Send it to your customer who can pay directly through the portal. Track payment status and mark jobs as paid.",
    detail: "Full payment status tracking from sent to paid.",
    color: "bg-amber-50 border-amber-200",
    numberColor: "text-amber-500",
  },
];

export default function HowItWorksSection() {
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
    <section id="how-it-works" className="py-24 bg-white" ref={sectionRef}>
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16 fade-up">
          <span className="inline-block text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">
            Simple Workflow
          </span>
          <h2 className="font-['Sora'] font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1B2B4B] mb-4">
            From First Call to Final Payment
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto leading-relaxed">
            FixYo follows the natural flow of a trade job. No complicated setup, no steep learning curve — just a clear path from job creation to getting paid.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[calc(12.5%-1px)] right-[calc(12.5%-1px)] h-0.5 bg-gradient-to-r from-amber-200 via-[#1B2B4B]/20 to-amber-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`fade-up relative`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Step card */}
                <div className={`rounded-2xl border p-6 h-full ${step.color}`}>
                  {/* Number */}
                  <div className={`font-['Sora'] font-extrabold text-5xl ${step.numberColor} mb-4 leading-none`}>
                    {step.number}
                  </div>
                  <h3 className="font-['Sora'] font-bold text-lg text-[#1B2B4B] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed mb-4">
                    {step.description}
                  </p>
                  <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
                    <ArrowRight className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-[#1B2B4B] font-medium">{step.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote document showcase */}
        <div className="mt-20 fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-amber-600 font-semibold text-sm uppercase tracking-widest mb-3">
                Professional Documents
              </span>
              <h3 className="font-['Sora'] font-extrabold text-3xl text-[#1B2B4B] mb-4">
                Documents That Look the Part
              </h3>
              <p className="text-[#64748B] leading-relaxed mb-6">
                Every quote, invoice, contract, and work authorisation generated by FixYo is professional, GST-compliant, and branded with your business details. Your customers will trust you from the first document.
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "Quotes with itemised materials and labour",
                  "Tax invoices with automatic GST",
                  "Contracts with digital signature capture",
                  "Work authorisations for customer approval",
                  "Daily site reports with PDF export",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-[#1B2B4B]">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-100/50 to-[#1B2B4B]/5 rounded-3xl blur-xl" />
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663486083546/D3Dtr5qP9UpRfB5okW7STw/fixyo-quote-doc-hkmZtYpMNn7JHY9FXsjHAo.webp"
                alt="FixYo professional quote document"
                className="relative w-full max-w-sm mx-auto rounded-2xl shadow-2xl shadow-[#1B2B4B]/15"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
