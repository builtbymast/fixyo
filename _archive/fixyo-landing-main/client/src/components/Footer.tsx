/* FixYo Footer — Warm Modernism
 * Deep navy background, warm cream text
 */
import { Wrench, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Price Estimator", href: "#features" },
  ],
  Trades: [
    { label: "Plumbers", href: "#trades" },
    { label: "Electricians", href: "#trades" },
    { label: "Carpenters", href: "#trades" },
    { label: "All Trades", href: "#trades" },
  ],
  Company: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  const scrollTo = (href: string) => {
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="bg-[#1B2B4B] text-white">
      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-['Sora'] font-bold text-xl">
                <span className="text-white">Fix</span>
                <span className="text-amber-400">Yo</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
              The all-in-one job management and quoting platform built exclusively for Australian tradespeople. Quote faster, invoice smarter, get paid on time.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Built for Australian Tradespeople</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:support@fixyo.ai" className="hover:text-amber-400 transition-colors">support@fixyo.ai</a>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-['Sora'] font-semibold text-sm text-white/90 mb-4 uppercase tracking-wider">
                {category}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 hover:text-amber-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => scrollTo(link.href)}
                        className="text-sm text-white/50 hover:text-amber-400 transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} FixYo Pty Ltd. All rights reserved. ABN 19 185 947 021
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
