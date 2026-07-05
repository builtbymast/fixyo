import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Briefcase, FileText, DollarSign, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Briefcase,
      label: "Active Jobs",
      value: stats?.activeJobs ?? 0,
      color: "text-blue-600",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      trend: "+2 this week",
    },
    {
      icon: FileText,
      label: "Pending Quotes",
      value: stats?.pendingQuotes ?? 0,
      color: "text-amber-600",
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      trend: "Awaiting reply",
    },
    {
      icon: DollarSign,
      label: "Outstanding Invoices",
      value: stats?.outstandingInvoices ?? 0,
      color: "text-red-500",
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      trend: "Action needed",
    },
    {
      icon: TrendingUp,
      label: "Total Revenue",
      value: `$${((stats?.totalRevenue ?? 0) / 100).toFixed(2)}`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      trend: "All time",
    },
  ];

  const quickActions = [
    { label: "New Job", href: "/app/jobs/new", icon: Briefcase, color: "bg-blue-500" },
    { label: "New Quote", href: "/app/quotes/new", icon: FileText, color: "bg-amber-500" },
    { label: "New Invoice", href: "/app/invoices/new", icon: DollarSign, color: "bg-emerald-500" },
    { label: "New Customer", href: "/app/customers/new", icon: Plus, color: "bg-violet-500" },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1B2B4B]">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your business today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`p-5 rounded-2xl ${s.bg} border border-white shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} style={{ width: 18, height: 18 }} />
              </div>
            </div>
            <div className={`text-2xl font-black ${s.color} mb-0.5`}>{s.value}</div>
            <div className="text-xs font-semibold text-slate-600">{s.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{s.trend}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1B2B4B]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a, i) => (
            <button
              key={i}
              onClick={() => setLocation(a.href)}
              className="group flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-[#1B2B4B]/30 hover:bg-slate-50 transition-all duration-150"
            >
              <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center flex-shrink-0`}>
                <a.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-[#1B2B4B]">{a.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1B2B4B] ml-auto transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Getting started / empty state hint */}
      {!stats?.activeJobs && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-[#1B2B4B] to-[#2d4875] rounded-2xl p-6 text-white"
        >
          <h3 className="font-bold text-lg mb-1">Welcome to FixYo 👋</h3>
          <p className="text-slate-300 text-sm mb-4">Get started by creating your first job or importing your customers.</p>
          <button
            onClick={() => setLocation("/app/jobs/new")}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Create your first job →
          </button>
        </motion.div>
      )}
    </div>
  );
}
