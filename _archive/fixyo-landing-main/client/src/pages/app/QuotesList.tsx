import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { FileText, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-amber-100 text-amber-700",
  viewed: "bg-cyan-100 text-cyan-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-600",
  expired: "bg-gray-100 text-gray-500",
};

export default function QuotesList() {
  const { data: quotes, isLoading } = trpc.quotes.list.useQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = (quotes ?? []).filter((q) => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.quoteNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout title="Quotes">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search quotes..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/app/quotes/new">
          <Button className="bg-[#1B2B4B] hover:bg-[#243a63] text-white gap-2">
            <Plus className="w-4 h-4" /> New Quote
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="grid gap-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">No quotes found</p>
            <Link href="/app/quotes/new"><Button className="mt-4 bg-[#1B2B4B] text-white">Create Quote</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((q) => (
            <Link key={q.id} href={`/app/quotes/${q.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1B2B4B] truncate">{q.title}</p>
                    <p className="text-sm text-gray-400">{q.quoteNumber} · ${parseFloat(q.total ?? "0").toLocaleString("en-AU", { minimumFractionDigits: 2 })} · {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[q.status] ?? "bg-gray-100 text-gray-600"}`}>{q.status}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
