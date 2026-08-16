import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Briefcase,
  DollarSign,
  FileText,
  Plus,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  invoiced: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-600",
  sent: "bg-amber-100 text-amber-700",
  viewed: "bg-cyan-100 text-cyan-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-600",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-600",
};

export default function Dashboard() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: recentJobs } = trpc.dashboard.recentJobs.useQuery();
  const { data: recentInvoices } = trpc.dashboard.recentInvoices.useQuery();

  const statCards = [
    {
      label: "Total Jobs",
      value: stats?.totalJobs ?? 0,
      icon: Briefcase,
      color: "bg-blue-50 text-blue-600",
      href: "/app/jobs",
    },
    {
      label: "Active Jobs",
      value: stats?.activeJobs ?? 0,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
      href: "/app/jobs",
    },
    {
      label: "Pending Quotes",
      value: stats?.pendingQuotes ?? 0,
      icon: FileText,
      color: "bg-purple-50 text-purple-600",
      href: "/app/quotes",
    },
    {
      label: "Revenue Collected",
      value: `$${parseFloat(stats?.totalRevenue ?? "0").toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      href: "/app/invoices",
    },
  ];

  return (
    <AppLayout title="Dashboard">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href="/app/jobs/new">
          <Button className="bg-[#1B2B4B] hover:bg-[#243a63] text-white gap-2">
            <Plus className="w-4 h-4" /> New Job
          </Button>
        </Link>
        <Link href="/app/quotes/new">
          <Button variant="outline" className="gap-2 border-[#1B2B4B] text-[#1B2B4B]">
            <FileText className="w-4 h-4" /> New Quote
          </Button>
        </Link>
        <Link href="/app/invoices/new">
          <Button variant="outline" className="gap-2 border-[#1B2B4B] text-[#1B2B4B]">
            <Receipt className="w-4 h-4" /> New Invoice
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-[#1B2B4B] font-['Sora']">{card.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{card.label}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-[#1B2B4B]">Recent Jobs</CardTitle>
            <Link href="/app/jobs">
              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 gap-1 text-xs">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {!recentJobs || recentJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No jobs yet</p>
                <Link href="/app/jobs/new">
                  <Button size="sm" className="mt-3 bg-[#1B2B4B] text-white">Create your first job</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <Link key={job.id} href={`/app/jobs/${job.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-[#1B2B4B] truncate">{job.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{job.jobNumber} · {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ml-3 flex-shrink-0 ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {job.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-[#1B2B4B]">Recent Invoices</CardTitle>
            <Link href="/app/invoices">
              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 gap-1 text-xs">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {!recentInvoices || recentInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No invoices yet</p>
                <Link href="/app/invoices/new">
                  <Button size="sm" className="mt-3 bg-[#1B2B4B] text-white">Create your first invoice</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((inv) => (
                  <Link key={inv.id} href={`/app/invoices/${inv.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-[#1B2B4B] truncate">{inv.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{inv.invoiceNumber} · ${parseFloat(inv.total ?? "0").toLocaleString("en-AU", { minimumFractionDigits: 2 })}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ml-3 flex-shrink-0 ${STATUS_COLORS[inv.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {inv.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
