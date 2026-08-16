/* FixYo Navbar — Warm Modernism
 * Sticky top nav with navy bg on scroll, transparent on top
 * Auth-aware: shows "Go to App" when logged in, "Sign In / Start Free Trial" when not
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Wrench, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Trades", href: "#trades" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#1B2B4B] shadow-lg shadow-[#1B2B4B]/20"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-['Sora'] text-xl tracking-tight" style={{ fontWeight: 800 }}>
              <span className={scrolled ? "text-white" : "text-[#1B2B4B]"}>Fix</span>
              <span className="text-amber-500">Yo</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className={`text-sm font-medium transition-colors hover:text-amber-500 ${
                  scrolled ? "text-white/80" : "text-[#1B2B4B]/70"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA Buttons — auth-aware */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              isAuthenticated ? (
                <Button
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 rounded-lg shadow-md shadow-amber-500/20 gap-1.5"
                  size="sm"
                  onClick={() => setLocation("/app/dashboard")}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to App
                </Button>
              ) : (
                <>
                  <a
                    href={getLoginUrl()}
                    className={`text-sm font-medium transition-colors hover:text-amber-500 ${
                      scrolled ? "text-white/80" : "text-[#1B2B4B]/70"
                    }`}
                  >
                    Sign In
                  </a>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 rounded-lg shadow-md shadow-amber-500/20"
                    size="sm"
                    onClick={() => window.location.href = getLoginUrl()}
                  >
                    Start Free Trial
                  </Button>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg ${scrolled ? "text-white" : "text-[#1B2B4B]"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1B2B4B] border-t border-white/10">
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="text-white/80 hover:text-amber-400 text-sm font-medium text-left py-2 border-b border-white/5 last:border-0"
              >
                {link.label}
              </button>
            ))}
            <div className="flex gap-3 pt-2">
              {!loading && (
                isAuthenticated ? (
                  <button
                    onClick={() => { setMobileOpen(false); setLocation("/app/dashboard"); }}
                    className="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                  >
                    Go to App
                  </button>
                ) : (
                  <>
                    <a
                      href={getLoginUrl()}
                      className="flex-1 text-center border border-white/20 text-white text-sm font-semibold py-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Sign In
                    </a>
                    <a
                      href={getLoginUrl()}
                      className="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                    >
                      Start Free Trial
                    </a>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
