import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { Plus, Receipt, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
const SC: Record<string,string> = { draft:"bg-gray-100 text-gray-600", sent:"bg-amber-100 text-amber-700", viewed:"bg-cyan-100 text-cyan-700", paid:"bg-green-100 text-green-700", overdue:"bg-red-100 text-red-600", cancelled:"bg-gray-100 text-gray-500" };
export default function InvoicesList() {
  const { data: invoices, isLoading } = trpc.invoices.list.useQuery();
  const [search, setSearch] = useState(""); const [sf, setSf] = useState("all");
  const filtered = (invoices??[]).filter(i => (i.title.toLowerCase().includes(search.toLowerCase())||i.invoiceNumber.toLowerCase().includes(search.toLowerCase())) && (sf==="all"||i.status===sf));
  return (
    <AppLayout title="Invoices">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search invoices..." className="pl-9" value={search} onChange={e=>setSearch(e.target.value)} /></div>
        <Select value={sf} onValueChange={setSf}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="overdue">Overdue</SelectItem></SelectContent></Select>
        <Link href="/app/invoices/new"><Button className="bg-[#1B2B4B] hover:bg-[#243a63] text-white gap-2"><Plus className="w-4 h-4"/>New Invoice</Button></Link>
      </div>
      {isLoading ? <div className="grid gap-3">{[1,2,3].map(i=><div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
      : filtered.length===0 ? <Card className="border-0 shadow-sm"><CardContent className="py-16 text-center"><Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300"/><p className="text-gray-500 font-medium">No invoices found</p><Link href="/app/invoices/new"><Button className="mt-4 bg-[#1B2B4B] text-white">Create Invoice</Button></Link></CardContent></Card>
      : <div className="grid gap-3">{filtered.map(inv=><Link key={inv.id} href={`/app/invoices/${inv.id}`}><Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0"><Receipt className="w-5 h-5 text-green-600"/></div><div className="flex-1 min-w-0"><p className="font-semibold text-[#1B2B4B] truncate">{inv.title}</p><p className="text-sm text-gray-400">{inv.invoiceNumber} · ${parseFloat(inv.total??"0").toLocaleString("en-AU",{minimumFractionDigits:2})} · {formatDistanceToNow(new Date(inv.createdAt),{addSuffix:true})}</p></div><span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${SC[inv.status]??"bg-gray-100 text-gray-600"}`}>{inv.status}</span></CardContent></Card></Link>)}</div>}
    </AppLayout>
  );
}
