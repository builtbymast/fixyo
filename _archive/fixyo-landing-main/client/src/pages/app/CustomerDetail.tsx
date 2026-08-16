import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useParams, useLocation } from "wouter";
import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Briefcase, Building2, Edit, FileText, Mail, MapPin, Phone, Receipt, Trash2, User,
} from "lucide-react";

const JOB_COLORS: Record<string,string> = { lead:"bg-gray-100 text-gray-600", active:"bg-blue-100 text-blue-700", completed:"bg-green-100 text-green-700", invoiced:"bg-purple-100 text-purple-700", cancelled:"bg-red-100 text-red-600" };
const QUOTE_COLORS: Record<string,string> = { draft:"bg-gray-100 text-gray-600", sent:"bg-amber-100 text-amber-700", accepted:"bg-green-100 text-green-700", declined:"bg-red-100 text-red-600", expired:"bg-orange-100 text-orange-600" };
const INV_COLORS: Record<string,string> = { draft:"bg-gray-100 text-gray-600", sent:"bg-amber-100 text-amber-700", viewed:"bg-blue-100 text-blue-700", paid:"bg-green-100 text-green-700", overdue:"bg-red-100 text-red-600" };

export default function CustomerDetail() {
  const { id } = useParams<{id:string}>();
  const [, setLocation] = useLocation();
  const cid = parseInt(id??"0");
  const { data: c, isLoading } = trpc.customers.get.useQuery({id:cid},{enabled:!!cid});
  const { data: jobs } = trpc.jobs.list.useQuery();
  const { data: quotes } = trpc.quotes.list.useQuery();
  const { data: invoices } = trpc.invoices.list.useQuery();
  const utils = trpc.useUtils();
  const del = trpc.customers.delete.useMutation({
    onSuccess: () => { toast.success("Customer deleted"); utils.customers.list.invalidate(); setLocation("/app/customers"); },
    onError: (e:any) => toast.error(e.message),
  });

  if(isLoading) return <AppLayout title="Customer"><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"/></div></AppLayout>;
  if(!c) return <AppLayout title="Not Found"><p className="text-gray-500 mb-4">Customer not found.</p><Button onClick={()=>setLocation("/app/customers")} variant="outline">Back</Button></AppLayout>;

  const cJobs = (jobs??[]).filter(j=>j.customerId===cid);
  const cQuotes = (quotes??[]).filter(q=>q.customerId===cid);
  const cInvoices = (invoices??[]).filter(i=>i.customerId===cid);
  const revenue = cInvoices.filter(i=>i.status==="paid").reduce((s,i)=>s+parseFloat(i.total??"0"),0);

  return (
    <AppLayout title={c.name}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" onClick={()=>setLocation("/app/customers")} className="gap-1.5 text-gray-500 flex-shrink-0"><ArrowLeft className="w-4 h-4"/>Customers</Button>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-[#1B2B4B] truncate">{c.name}</h1>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={()=>setLocation(`/app/customers/${cid}/edit`)} className="gap-1.5"><Edit className="w-4 h-4"/>Edit</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"><Trash2 className="w-4 h-4"/>Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete Customer?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {c.name}.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={()=>del.mutate({id:cid})} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base text-[#1B2B4B] flex items-center gap-2"><User className="w-4 h-4 text-amber-500"/>Contact Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {c.company&&<div className="flex items-center gap-2 text-gray-600"><Building2 className="w-4 h-4 text-gray-400"/>{c.company}</div>}
              {c.phone&&<div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4 text-gray-400"/><a href={`tel:${c.phone}`} className="hover:text-amber-600">{c.phone}</a></div>}
              {c.email&&<div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4 text-gray-400"/><a href={`mailto:${c.email}`} className="hover:text-amber-600 break-all">{c.email}</a></div>}
              {(c.address||c.city)&&<div className="flex items-start gap-2 text-gray-600"><MapPin className="w-4 h-4 text-gray-400 mt-0.5"/><div>{c.address&&<p>{c.address}</p>}{(c.city||c.state)&&<p>{[c.city,c.state,c.postcode].filter(Boolean).join(", ")}</p>}</div></div>}
              {c.notes&&<div className="pt-2 border-t border-gray-100"><p className="text-xs text-gray-400 mb-1">Notes</p><p className="text-gray-600 whitespace-pre-wrap">{c.notes}</p></div>}
            </CardContent>
          </Card>
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-0 shadow-sm text-center p-3"><p className="text-2xl font-bold text-[#1B2B4B]">{cJobs.length}</p><p className="text-xs text-gray-400 mt-0.5">Jobs</p></Card>
            <Card className="border-0 shadow-sm text-center p-3"><p className="text-2xl font-bold text-[#1B2B4B]">{cQuotes.length}</p><p className="text-xs text-gray-400 mt-0.5">Quotes</p></Card>
            <Card className="border-0 shadow-sm text-center p-3"><p className="text-2xl font-bold text-amber-600">${revenue.toFixed(0)}</p><p className="text-xs text-gray-400 mt-0.5">Revenue</p></Card>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-[#1B2B4B] flex items-center gap-2"><Briefcase className="w-4 h-4 text-amber-500"/>Jobs ({cJobs.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={()=>setLocation("/app/jobs/new")} className="text-xs h-7">+ New Job</Button>
            </CardHeader>
            <CardContent>{cJobs.length===0?<p className="text-sm text-gray-400 text-center py-4">No jobs yet</p>:<div className="space-y-2">{cJobs.map(j=><div key={j.id} onClick={()=>setLocation(`/app/jobs/${j.id}`)} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"><div><p className="text-sm font-medium text-[#1B2B4B]">{j.title}</p><p className="text-xs text-gray-400">{j.jobNumber} · {format(new Date(j.createdAt),"dd MMM yyyy")}</p></div><Badge className={`text-xs ${JOB_COLORS[j.status]??"bg-gray-100 text-gray-600"}`}>{j.status}</Badge></div>)}</div>}</CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-[#1B2B4B] flex items-center gap-2"><FileText className="w-4 h-4 text-amber-500"/>Quotes ({cQuotes.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={()=>setLocation("/app/quotes/new")} className="text-xs h-7">+ New Quote</Button>
            </CardHeader>
            <CardContent>{cQuotes.length===0?<p className="text-sm text-gray-400 text-center py-4">No quotes yet</p>:<div className="space-y-2">{cQuotes.map(q=><div key={q.id} onClick={()=>setLocation(`/app/quotes/${q.id}`)} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"><div><p className="text-sm font-medium text-[#1B2B4B]">{q.title}</p><p className="text-xs text-gray-400">{q.quoteNumber} · {format(new Date(q.createdAt),"dd MMM yyyy")}</p></div><div className="flex items-center gap-2"><span className="text-sm font-semibold">${parseFloat(q.total??"0").toFixed(2)}</span><Badge className={`text-xs ${QUOTE_COLORS[q.status]??"bg-gray-100 text-gray-600"}`}>{q.status}</Badge></div></div>)}</div>}</CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-[#1B2B4B] flex items-center gap-2"><Receipt className="w-4 h-4 text-amber-500"/>Invoices ({cInvoices.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={()=>setLocation("/app/invoices/new")} className="text-xs h-7">+ New Invoice</Button>
            </CardHeader>
            <CardContent>{cInvoices.length===0?<p className="text-sm text-gray-400 text-center py-4">No invoices yet</p>:<div className="space-y-2">{cInvoices.map(i=><div key={i.id} onClick={()=>setLocation(`/app/invoices/${i.id}`)} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer"><div><p className="text-sm font-medium text-[#1B2B4B]">{i.title}</p><p className="text-xs text-gray-400">{i.invoiceNumber} · {format(new Date(i.createdAt),"dd MMM yyyy")}</p></div><div className="flex items-center gap-2"><span className="text-sm font-semibold">${parseFloat(i.total??"0").toFixed(2)}</span><Badge className={`text-xs ${INV_COLORS[i.status]??"bg-gray-100 text-gray-600"}`}>{i.status}</Badge></div></div>)}</div>}</CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
