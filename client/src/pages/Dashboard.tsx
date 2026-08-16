import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Briefcase, FileText, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  if (isLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const statCards = [
    { icon: Briefcase, label: "Active Jobs", value: stats?.activeJobs || 0, color: "bg-blue-100 text-blue-600" },
    { icon: FileText, label: "Pending Quotes", value: stats?.pendingQuotes || 0, color: "bg-amber-100 text-amber-600" },
    { icon: FileText, label: "Outstanding Invoices", value: stats?.outstandingInvoices || 0, color: "bg-red-100 text-red-600" },
    { icon: DollarSign, label: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => setLocation("/app/jobs/new")} className="p-3 rounded-lg border border-border hover:bg-accent/10 transition-colors text-sm font-medium">
            New Job
          </button>
          <button onClick={() => setLocation("/app/quotes/new")} className="p-3 rounded-lg border border-border hover:bg-accent/10 transition-colors text-sm font-medium">
            New Quote
          </button>
          <button onClick={() => setLocation("/app/invoices/new")} className="p-3 rounded-lg border border-border hover:bg-accent/10 transition-colors text-sm font-medium">
            New Invoice
          </button>
          <button onClick={() => setLocation("/app/customers/new")} className="p-3 rounded-lg border border-border hover:bg-accent/10 transition-colors text-sm font-medium">
            New Customer
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
