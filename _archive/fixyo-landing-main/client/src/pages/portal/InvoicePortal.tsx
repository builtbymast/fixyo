import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CheckCircle, Wrench } from "lucide-react";
import { useParams } from "wouter";

export default function InvoicePortal() {
  const { token } = useParams<{ token: string }>();
  const { data: invoice, isLoading, error } = trpc.invoices.getPublic.useQuery({ token: token ?? "" }, { enabled: !!token });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;
  if (error || !invoice) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
      <Card className="max-w-md w-full mx-4 border-0 shadow-lg"><CardContent className="py-12 text-center"><p className="text-gray-500">Invoice not found or link has expired.</p></CardContent></Card>
    </div>
  );

  const subtotal = parseFloat(invoice.subtotal ?? "0");
  const taxAmount = parseFloat(invoice.taxAmount ?? "0");
  const total = parseFloat(invoice.total ?? "0");

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center"><Wrench className="w-5 h-5 text-white" strokeWidth={2.5} /></div>
          <span className="font-['Sora'] text-2xl font-extrabold"><span className="text-[#1B2B4B]">Fix</span><span className="text-amber-500">Yo</span></span>
        </div>

        <Card className="border-0 shadow-lg mb-4">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl text-[#1B2B4B]">{invoice.title}</CardTitle>
                <p className="text-sm text-gray-400 mt-1">{invoice.invoiceNumber} · {format(new Date(invoice.createdAt), "dd MMM yyyy")}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${invoice.status === "paid" ? "bg-green-100 text-green-700" : invoice.status === "overdue" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>{invoice.status}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {invoice.dueDate && <div className="flex items-center gap-2 text-sm"><span className="text-gray-400">Due:</span><span className={`font-medium ${invoice.status === "overdue" ? "text-red-600" : "text-[#1B2B4B]"}`}>{format(new Date(invoice.dueDate), "dd MMM yyyy")}</span></div>}
            {invoice.notes && <div><p className="text-sm font-medium text-[#1B2B4B] mb-1">Notes</p><p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p></div>}
            <div>
              <p className="text-sm font-medium text-[#1B2B4B] mb-3">Items</p>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100"><th className="text-left py-2 text-gray-400 font-medium">Description</th><th className="text-right py-2 text-gray-400 font-medium">Qty</th><th className="text-right py-2 text-gray-400 font-medium">Unit Price</th><th className="text-right py-2 text-gray-400 font-medium">Total</th></tr></thead>
                <tbody>
                  {(invoice.lineItems ?? []).map((item: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-[#1B2B4B]">{item.description}</td>
                      <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-600">${parseFloat(String(item.unitPrice)).toFixed(2)}</td>
                      <td className="py-2 text-right font-medium">${(parseFloat(String(item.quantity)) * parseFloat(String(item.unitPrice))).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>GST ({invoice.taxRate ?? "10"}%)</span><span>${taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-[#1B2B4B] text-lg pt-2 border-t border-gray-200"><span>Total (inc. GST)</span><span>${total.toFixed(2)}</span></div>
              </div>
            </div>
            {invoice.terms && <div><p className="text-sm font-medium text-[#1B2B4B] mb-1">Terms & Conditions</p><p className="text-xs text-gray-500 whitespace-pre-wrap">{invoice.terms}</p></div>}
          </CardContent>
        </Card>

        {invoice.status === "paid" ? (
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div><p className="font-semibold text-green-800">Payment Received</p>{invoice.paidAt && <p className="text-sm text-green-600">Paid on {format(new Date(invoice.paidAt), "dd MMM yyyy")}</p>}</div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-[#1B2B4B] mb-2">Payment Details</p>
              {invoice.business?.bankName ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="text-gray-400">Bank:</span> {invoice.business.bankName}</p>
                  {invoice.business.accountName && <p><span className="text-gray-400">Account Name:</span> {invoice.business.accountName}</p>}
                  {invoice.business.bsb && <p><span className="text-gray-400">BSB:</span> {invoice.business.bsb}</p>}
                  {invoice.business.accountNumber && <p><span className="text-gray-400">Account Number:</span> {invoice.business.accountNumber}</p>}
                  <p className="text-xs text-gray-400 mt-2">Please use invoice number {invoice.invoiceNumber} as reference.</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Please contact your tradie for payment details.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
