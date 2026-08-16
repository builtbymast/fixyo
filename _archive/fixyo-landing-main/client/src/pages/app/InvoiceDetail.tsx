import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle, Copy, Edit, Send } from "lucide-react";
import { Link, useParams } from "wouter";
const SC: Record<string,string> = { draft:"bg-gray-100 text-gray-600", sent:"bg-amber-100 text-amber-700", viewed:"bg-cyan-100 text-cyan-700", paid:"bg-green-100 text-green-700", overdue:"bg-red-100 text-red-600" };
export default function InvoiceDetail() {
  const { id } = useParams<{id:string}>(); const invoiceId = parseInt(id??"0"); const utils = trpc.useUtils();
  const { data: inv, isLoading } = trpc.invoices.get.useQuery({id:invoiceId},{enabled:!!invoiceId});
  const send = trpc.invoices.send.useMutation({ onSuccess:({publicToken})=>{ utils.invoices.get.invalidate({id:invoiceId}); const url=`${window.location.origin}/portal/invoice/${publicToken}`; navigator.clipboard.writeText(url).then(()=>toast.success("Invoice sent! Portal link copied.")); }, onError:(e:any)=>toast.error(e.message) });
  const markPaid = trpc.invoices.markPaid.useMutation({ onSuccess:()=>{ utils.invoices.get.invalidate({id:invoiceId}); toast.success("Marked as paid!"); }, onError:(e:any)=>toast.error(e.message) });
  if (isLoading) return <AppLayout title="Invoice"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3"/><div className="h-40 bg-gray-200 rounded-xl"/></div></AppLayout>;
  if (!inv) return <AppLayout title="Not Found"><p className="text-gray-500">Invoice not found.</p><Link href="/app/invoices"><Button className="mt-4">Back</Button></Link></AppLayout>;
  const portalUrl = `${window.location.origin}/portal/invoice/${inv.publicToken}`;
  return (
    <AppLayout title={inv.title}>
      <div className="flex items-center gap-3 mb-6"><Link href="/app/invoices"><Button variant="ghost" size="sm" className="gap-1 text-gray-500"><ArrowLeft className="w-4 h-4"/>Invoices</Button></Link><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${SC[inv.status]??"bg-gray-100 text-gray-600"}`}>{inv.status}</span></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base text-[#1B2B4B]">Invoice Details</CardTitle><Link href={`/app/invoices/${inv.id}/edit`}><Button size="sm" variant="outline" className="gap-1"><Edit className="w-3 h-3"/>Edit</Button></Link></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Invoice Number</span><p className="font-medium text-[#1B2B4B]">{inv.invoiceNumber}</p></div>
                <div><span className="text-gray-400">Created</span><p className="font-medium text-[#1B2B4B]">{format(new Date(inv.createdAt),"dd MMM yyyy")}</p></div>
                {inv.dueDate&&<div><span className="text-gray-400">Due Date</span><p className="font-medium text-[#1B2B4B]">{format(new Date(inv.dueDate),"dd MMM yyyy")}</p></div>}
                {inv.paidAt&&<div><span className="text-gray-400">Paid</span><p className="font-medium text-green-600">{format(new Date(inv.paidAt),"dd MMM yyyy")}</p></div>}
              </div>
              {inv.notes&&<div className="pt-2 border-t border-gray-100"><p className="text-xs text-gray-400 mb-1">Notes</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{inv.notes}</p></div>}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Line Items</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm"><thead><tr className="border-b border-gray-100"><th className="text-left py-2 text-gray-400 font-medium">Description</th><th className="text-right py-2 text-gray-400 font-medium">Qty</th><th className="text-right py-2 text-gray-400 font-medium">Unit Price</th><th className="text-right py-2 text-gray-400 font-medium">Total</th></tr></thead>
                <tbody>{(inv.lineItems??[]).map((item:any,i:number)=><tr key={i} className="border-b border-gray-50"><td className="py-2 text-[#1B2B4B]">{item.description}</td><td className="py-2 text-right text-gray-600">{item.quantity}</td><td className="py-2 text-right text-gray-600">${parseFloat(String(item.unitPrice)).toFixed(2)}</td><td className="py-2 text-right font-medium text-[#1B2B4B]">${(parseFloat(String(item.quantity))*parseFloat(String(item.unitPrice))).toFixed(2)}</td></tr>)}</tbody></table>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${parseFloat(inv.subtotal??"0").toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>GST ({inv.taxRate??"10"}%)</span><span>${parseFloat(inv.taxAmount??"0").toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-[#1B2B4B] text-base pt-2 border-t border-gray-200"><span>Total</span><span>${parseFloat(inv.total??"0").toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>
          {inv.status==="paid"&&<Card className="border-0 shadow-sm bg-green-50"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0"/><div><p className="font-medium text-green-800">Payment Received</p>{inv.paidAt&&<p className="text-sm text-green-600">{format(new Date(inv.paidAt),"dd MMM yyyy")}</p>}</div></CardContent></Card>}
        </div>
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {inv.status==="draft"&&<Button onClick={()=>send.mutate({id:inv.id})} disabled={send.isPending} className="w-full bg-[#1B2B4B] text-white gap-2"><Send className="w-4 h-4"/>{send.isPending?"Sending...":"Send to Customer"}</Button>}
              {(inv.status==="sent"||inv.status==="viewed")&&<Button onClick={()=>markPaid.mutate({id:inv.id})} disabled={markPaid.isPending} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"><CheckCircle className="w-4 h-4"/>{markPaid.isPending?"Marking...":"Mark as Paid"}</Button>}
              <Button variant="outline" className="w-full gap-2 text-sm" onClick={()=>{navigator.clipboard.writeText(portalUrl);toast.success("Portal link copied!")}}><Copy className="w-4 h-4"/>Copy Portal Link</Button>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-sm text-[#1B2B4B]">Customer Portal Link</CardTitle></CardHeader><CardContent><p className="text-xs text-gray-400 break-all">{portalUrl}</p></CardContent></Card>
        </div>
      </div>
    </AppLayout>
  );
}
