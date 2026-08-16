import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
export default function CustomersList() {
  const { data: customers, isLoading } = trpc.customers.list.useQuery();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState(""); const [open, setOpen] = useState(false);
  const [form, setForm] = useState({name:"",email:"",phone:"",company:"",address:""});
  const create = trpc.customers.create.useMutation({onSuccess:()=>{toast.success("Customer added!");utils.customers.list.invalidate();setOpen(false);setForm({name:"",email:"",phone:"",company:"",address:""});},onError:(e:any)=>toast.error(e.message)});
  const filtered = (customers??[]).filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||(c.email??"").toLowerCase().includes(search.toLowerCase()));
  return (
    <AppLayout title="Customers">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/><Input placeholder="Search customers..." className="pl-9" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-[#1B2B4B] hover:bg-[#243a63] text-white gap-2"><Plus className="w-4 h-4"/>Add Customer</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
            <form onSubmit={e=>{e.preventDefault();create.mutate(form);}} className="space-y-3 mt-2">
              <div><Label>Name *</Label><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required className="mt-1"/></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="mt-1"/></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="mt-1"/></div>
              <div><Label>Company</Label><Input value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} className="mt-1"/></div>
              <div><Label>Address</Label><Input value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} className="mt-1"/></div>
              <Button type="submit" disabled={create.isPending} className="w-full bg-[#1B2B4B] text-white">{create.isPending?"Saving...":"Add Customer"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading?<div className="grid gap-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
      :filtered.length===0?<Card className="border-0 shadow-sm"><CardContent className="py-16 text-center"><Users className="w-12 h-12 mx-auto mb-3 text-gray-300"/><p className="text-gray-500 font-medium">No customers yet</p><Button className="mt-4 bg-[#1B2B4B] text-white" onClick={()=>setOpen(true)}>Add Customer</Button></CardContent></Card>
      :<div className="grid gap-3">{filtered.map(c=><Link key={c.id} href={`/app/customers/${c.id}`}><Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"><CardContent className="p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 font-bold">{c.name[0].toUpperCase()}</div><div className="flex-1 min-w-0"><p className="font-semibold text-[#1B2B4B] truncate">{c.name}</p><p className="text-sm text-gray-400">{c.email??""}{c.phone?` · ${c.phone}`:""}</p></div></CardContent></Card></Link>)}</div>}
    </AppLayout>
  );
}
