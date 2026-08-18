import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  Loader2, Briefcase, FileText, DollarSign, Users, Zap, BarChart3,
  CheckCircle, Star, ArrowRight, Menu, X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  motion, useInView, useMotionValue, useTransform, useSpring, AnimatePresence,
} from "framer-motion";

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 180, damping: 18 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Scroll-triggered fade-in ─────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated number counter ──────────────────────────────────────────────────
function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.floor(eased * to));
      if (t < 1) requestAnimationFrame(tick);
      else setVal(to);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !loading) navigate("/app/dashboard");
  }, [isAuthenticated, user, loading, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B2B4B]" />
      </div>
    );
  }

  const features = [
    { icon: Briefcase, title: "Job Management", desc: "Track every job from scheduling to completion. Photos, notes, and real-time status — all in one place.", grad: "from-blue-500 to-blue-700" },
    { icon: FileText, title: "Smart Quoting", desc: "Build professional quotes in minutes. Customers sign digitally — no more chasing paperwork or printing.", grad: "from-amber-500 to-amber-700" },
    { icon: DollarSign, title: "Online Payments", desc: "Accept Stripe payments directly from invoices. Automated reminders chase overdue clients for you.", grad: "from-emerald-500 to-emerald-700" },
    { icon: Users, title: "Customer CRM", desc: "Full contact history, job records, and payment notes for every customer — always at your fingertips.", grad: "from-violet-500 to-violet-700" },
    { icon: Zap, title: "AI Assistant", desc: "Generate job descriptions, quote copy, and professional emails with one click using built-in Claude AI.", grad: "from-rose-500 to-rose-700" },
    { icon: BarChart3, title: "Business Reports", desc: "Revenue, outstanding invoices, conversion rates. Know exactly where your business stands, anytime.", grad: "from-teal-500 to-teal-700" },
  ];

  const steps = [
    { n: "01", title: "Create your account", desc: "Sign up free in under 60 seconds — no credit card, no lock-in." },
    { n: "02", title: "Set up your business", desc: "Add your ABN, logo and bank details. Looks professional from day one." },
    { n: "03", title: "Start winning jobs", desc: "Quote, invoice, and get paid — from your phone or desktop, anywhere." },
  ];

  const testimonials = [
    { name: "Dave Hartley", role: "Electrician, Brisbane", text: "FixYo saved me hours every week. I quote on-site now and customers sign off instantly. Getting paid has never been easier.", stars: 5 },
    { name: "Sarah Mitchell", role: "Plumber, Sydney", text: "Finally a tool built for tradies, not accountants. The AI quote generator is unreal — I look way more professional now.", stars: 5 },
    { name: "Mark Okonkwo", role: "Builder, Melbourne", text: "Went from chasing payments for weeks to getting paid same-day. The Stripe integration is seamless.", stars: 5 },
  ];

  const plans = [
    { name: "Free", price: 0, desc: "Great for getting started", feats: ["5 jobs/month", "3 quotes/month", "3 invoices/month", "Customer management"], cta: "Start Free", hot: false },
    { name: "Starter", price: 29, desc: "For growing trade businesses", feats: ["Unlimited jobs", "Unlimited quotes & invoices", "Online payments (Stripe)", "PDF exports", "Email support"], cta: "Start Free Trial", hot: true },
    { name: "Pro", price: 79, desc: "For established tradies", feats: ["Everything in Starter", "AI Assistant", "Business analytics", "Priority support", "Custom branding", "3 users"], cta: "Start Free Trial", hot: false },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] overflow-x-hidden">

      {/* ─── STICKY HEADER ─────────────────────────────────────── */}
      <motion.header
        initial={{ y: -72 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/85 backdrop-blur-xl shadow-sm border-b border-white/30" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B2B4B] to-[#2d4875] flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-sm tracking-tight">FY</span>
            </div>
            <span className={`text-xl font-extrabold tracking-tight ${scrolled ? "text-[#1B2B4B]" : "text-white"}`}>FixYo</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {[["features", "Features"], ["how-it-works", "How it works"], ["pricing", "Pricing"]].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`text-sm font-medium transition-colors ${scrolled ? "text-slate-600 hover:text-[#1B2B4B]" : "text-white/80 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className={`text-sm font-medium transition-colors ${scrolled ? "text-slate-600 hover:text-[#1B2B4B]" : "text-white/80 hover:text-white"}`}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/35 active:translate-y-0"
            >
              Get Started Free →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 space-y-1"
            >
              {[["features", "Features"], ["how-it-works", "How it works"], ["pricing", "Pricing"]].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {label}
                </button>
              ))}
              <Link href="/sign-in" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Sign In</Link>
              <Link href="/sign-up" className="block px-3 py-3 bg-[#F59E0B] text-white font-bold rounded-xl text-sm text-center mt-2">
                Get Started Free →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 pb-20 overflow-hidden bg-gradient-to-br from-[#0D1B2E] via-[#1B2B4B] to-[#0D1B2E]">
        {/* Ambient glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)" }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-20 -left-40 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }}
          />
          {/* subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — copy */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/25 text-amber-300 text-xs font-semibold mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Built for Australian Tradies · 2026
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-white leading-[1.08] tracking-tight mb-6"
              >
                Run your trade{" "}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)" }}
                >
                  smarter,
                </span>
                <br />not harder.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-slate-300 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                Quote faster, invoice smarter, get paid on time. The all-in-one platform built from the ground up for Aussie tradies.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl text-base shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/45 transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
                >
                  Start for Free <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => scrollTo("how-it-works")}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold rounded-xl text-base backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5"
                >
                  See how it works
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="mt-8 flex items-center gap-3 justify-center lg:justify-start"
              >
                <div className="flex -space-x-2.5">
                  {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"].map((bg, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1B2B4B] flex items-center justify-center text-[10px] font-bold text-white" style={{ background: bg }}>
                      {["D", "S", "M", "J", "R"][i]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-slate-300">
                  <span className="text-amber-400 font-bold">2,000+</span> tradies trust FixYo
                </span>
              </motion.div>
            </div>

            {/* Right — 3D dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.35 }}
              className="relative hidden lg:block"
              style={{ perspective: 1400 }}
            >
              <motion.div
                animate={{ rotateX: [5, 2.5, 5], rotateY: [-7, -4, -7], y: [0, -14, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Browser shell */}
                <div className="rounded-2xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] border border-white/10">
                  {/* Titlebar */}
                  <div className="bg-[#0F172A] px-4 py-3 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                      <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    </div>
                    <div className="flex-1 bg-slate-800 rounded-md px-3 py-1 text-[11px] text-slate-500 font-mono">
                      fixyo.ai/app/dashboard
                    </div>
                  </div>

                  {/* App layout */}
                  <div className="flex bg-slate-50" style={{ height: 340 }}>
                    {/* Sidebar */}
                    <div className="w-[56px] bg-[#0F172A] flex flex-col items-center py-4 gap-3 border-r border-white/5 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center">
                        <span className="text-amber-400 text-[10px] font-black">FY</span>
                      </div>
                      {[BarChart3, Briefcase, FileText, DollarSign, Users, Zap].map((Icon, i) => (
                        <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${i === 0 ? "bg-amber-400/20" : "hover:bg-white/5"}`}>
                          <Icon className={`w-4 h-4 ${i === 0 ? "text-amber-400" : "text-slate-600"}`} />
                        </div>
                      ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 overflow-hidden">
                      <p className="text-[11px] font-bold text-slate-700 mb-3">Dashboard</p>
                      {/* Stat cards */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[
                          { label: "Active Jobs", val: "12", color: "text-blue-600" },
                          { label: "Revenue (MTD)", val: "$14,230", color: "text-emerald-600" },
                          { label: "Pending Quotes", val: "5", color: "text-amber-600" },
                          { label: "Unpaid Invoices", val: "3", color: "text-red-500" },
                        ].map((s, i) => (
                          <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                            <div className="text-[9px] text-slate-400 font-medium mb-1">{s.label}</div>
                            <div className={`text-base font-black ${s.color}`}>{s.val}</div>
                          </div>
                        ))}
                      </div>
                      {/* Mini bar chart */}
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                        <div className="text-[9px] font-bold text-slate-400 mb-2">Monthly Revenue</div>
                        <div className="flex items-end gap-1 h-14">
                          {[35, 55, 40, 70, 50, 80, 62, 78, 55, 88, 70, 100].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 11 ? "#F59E0B" : "#1B2B4B", opacity: i === 11 ? 1 : 0.2 + i * 0.065 }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating notification badges */}
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute -bottom-5 -left-8 bg-white rounded-2xl px-3.5 py-2.5 shadow-2xl border border-gray-100 flex items-center gap-2.5"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Invoice Paid</div>
                    <div className="text-sm font-black text-slate-800">+$1,850.00</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -9, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute -top-5 -right-8 bg-white rounded-2xl px-3.5 py-2.5 shadow-2xl border border-gray-100"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="text-[10px] text-slate-400 font-medium">Quote Signed</div>
                  <div className="text-sm font-black text-amber-600">🔥 $3,200 job won</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 inset-x-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="#FAFAF7" />
          </svg>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ───────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { to: 2000, suffix: "+", label: "Active Tradies" },
              { to: 10, prefix: "$", suffix: "M+", label: "Invoiced to Date" },
              { to: 98, suffix: "%", label: "Satisfaction Rate" },
              { to: 4, suffix: ".9 ★", label: "Average Rating" },
            ].map((s, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="text-3xl font-black text-[#1B2B4B]">
                  <Counter to={s.to} prefix={s.prefix ?? ""} suffix={s.suffix} />
                </div>
                <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wide">{s.label}</div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 mb-3 block">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B2B4B] mb-4">
              Everything you need to run your trade business
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              No more juggling spreadsheets and paper invoices. One platform, everything in one place.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <TiltCard className="h-full p-7 rounded-2xl bg-white/75 backdrop-blur-sm border border-white shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-shadow duration-400 cursor-default group">
                  <div
                    className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${f.grad} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    style={{ transform: "translateZ(24px)", width: 52, height: 52 }}
                  >
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-[17px] text-[#1B2B4B] mb-2" style={{ transform: "translateZ(12px)" }}>
                    {f.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed" style={{ transform: "translateZ(6px)" }}>
                    {f.desc}
                  </p>
                </TiltCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 bg-gradient-to-br from-[#0D1B2E] via-[#1B2B4B] to-[#0D1B2E] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3 block">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Up and running in under 5 minutes</h2>
            <p className="text-slate-400 max-w-xl mx-auto">No complicated setup. No credit card required.</p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <FadeUp key={i} delay={i * 0.14} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center">
                    <span className="text-2xl font-black text-amber-400">{s.n}</span>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-px" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.4) 0%, rgba(245,158,11,0) 100%)", transform: "translateY(-50%)" }} />
                  )}
                </div>
                <h3 className="font-bold text-lg text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.4} className="mt-12 text-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-xl shadow-amber-500/30"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────────── */}
      <section className="py-28 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 mb-3 block">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B2B4B]">Tradies love FixYo</h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="h-full p-7 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-5">"{t.text}"</p>
                  <div>
                    <div className="font-bold text-sm text-[#1B2B4B]">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 mb-3 block">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B2B4B] mb-4">Simple, honest pricing</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Start free. Upgrade when you're ready. No lock-in contracts.</p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map((p, i) => (
              <FadeUp key={i} delay={i * 0.09}>
                <div className={`relative p-7 rounded-2xl border h-full flex flex-col transition-all ${
                  p.hot
                    ? "bg-[#1B2B4B] border-[#1B2B4B] shadow-2xl shadow-[#1B2B4B]/25 scale-[1.03]"
                    : "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                }`}>
                  {p.hot && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 rounded-full text-xs font-black text-white shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <div className={`font-black text-xl mb-1 ${p.hot ? "text-white" : "text-[#1B2B4B]"}`}>{p.name}</div>
                    <div className={`text-xs mb-4 ${p.hot ? "text-slate-400" : "text-slate-500"}`}>{p.desc}</div>
                    <div className={`flex items-baseline gap-1 ${p.hot ? "text-white" : "text-[#1B2B4B]"}`}>
                      <span className="text-4xl font-black">${p.price}</span>
                      <span className="text-sm opacity-50">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {p.feats.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.hot ? "text-amber-400" : "text-emerald-500"}`} />
                        <span className={p.hot ? "text-slate-300" : "text-slate-600"}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={`block text-center py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 ${
                      p.hot
                        ? "bg-amber-400 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                        : "bg-[#1B2B4B] hover:bg-[#2d4875] text-white"
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to take control of your trade business?
            </h2>
            <p className="text-amber-100 mb-8 text-lg max-w-xl mx-auto">
              Join 2,000+ Australian tradies. Start for free — no credit card required.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#1B2B4B] hover:bg-[#2d4875] text-white font-extrabold rounded-2xl text-lg shadow-2xl shadow-black/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-3xl"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-5 text-amber-200 text-sm">Free forever plan · No credit card · Cancel anytime</p>
          </FadeUp>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-[#0D1B2E] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1B2B4B] to-[#2d4875] flex items-center justify-center">
                <span className="text-white font-black text-xs">FY</span>
              </div>
              <span className="font-extrabold text-white text-lg">FixYo</span>
            </div>
            <div className="flex gap-7 text-sm text-slate-400">
              {["Privacy", "Terms", "Contact"].map((l) => (
                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
              ))}
            </div>
            <p className="text-slate-500 text-sm">&copy; 2026 FixYo Pty Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
