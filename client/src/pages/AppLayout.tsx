import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3, Briefcase, FileText, Users, Zap, Settings, LogOut, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: BarChart3, label: "Dashboard", href: "/app/dashboard" },
  { icon: Briefcase, label: "Jobs", href: "/app/jobs" },
  { icon: FileText, label: "Quotes", href: "/app/quotes" },
  { icon: DollarSign, label: "Invoices", href: "/app/invoices" },
  { icon: Users, label: "Customers", href: "/app/customers" },
  { icon: Zap, label: "AI", href: "/app/ai" },
  { icon: Settings, label: "Settings", href: "/app/settings/business" },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const { logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-[#0F172A] flex flex-col border-r border-white/5">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1B2B4B] to-[#2d4875] flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-black text-xs">FY</span>
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">FixYo</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => setLocation(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-amber-400/15 text-amber-400"
                    : "text-slate-400 hover:text-white hover:bg-white/6"
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-amber-400" : ""}`} style={{ width: 18, height: 18 }} />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1 h-4 rounded-full bg-amber-400"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-400/8 transition-all duration-150"
          >
            <LogOut style={{ width: 18, height: 18 }} className="flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-500 capitalize">
            {navItems.find((n) => location.startsWith(n.href))?.label ?? "FixYo"}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B2B4B] to-[#2d4875] flex items-center justify-center">
              <span className="text-white text-xs font-bold">U</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
