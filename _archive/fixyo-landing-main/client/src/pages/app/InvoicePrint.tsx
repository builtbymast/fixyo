import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Wrench } from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react";

export default function InvoicePrint() {
  const { id } = useParams<{ id: string }>();
  const iid = parseInt(id ?? "0");
  const { data: invoiceData } = trpc.invoices.get.useQuery({ id: iid }, { enabled: !!iid });
  const { data: business } = trpc.business.get.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: jobs } = trpc.jobs.list.useQuery();

  useEffect(() => {
    if (invoiceData && business) {
      document.title = `Invoice ${invoiceData.invoiceNumber} — ${business.name ?? "FixYo"}`;
    }
  }, [invoiceData, business]);

  const customer = customers?.find(c => c.id === invoiceData?.customerId);
  const job = jobs?.find(j => j.id === invoiceData?.jobId);
  const isLoading = !invoiceData && !!iid;

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!invoiceData) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Invoice not found.</p>
    </div>
  );

  const inv = invoiceData;
  const subtotal = parseFloat(inv.subtotal ?? "0");
  const taxRate2 = parseFloat(inv.taxRate ?? "0");
  const gstAmount = taxRate2 > 0 ? subtotal * (taxRate2 / 100) : 0;
  const total = parseFloat(inv.total ?? "0");
  const lineItems = inv.lineItems ?? [];

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Print controls */}
      <div className="print:hidden bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5 text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-600 font-medium">{inv.invoiceNumber}</span>
        <div className="ml-auto">
          <Button onClick={() => window.print()} className="gap-1.5 bg-[#1B2B4B] hover:bg-[#243a63]">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-[794px] mx-auto my-8 print:my-0 bg-white shadow-lg print:shadow-none p-12 print:p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            {business?.logoUrl ? (
              <img src={business.logoUrl} alt={business.name ?? "Logo"} className="h-14 object-contain mb-2" />
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-extrabold tracking-tight">
                  <span className="text-[#1B2B4B]">Fix</span><span className="text-amber-500">Yo</span>
                </span>
              </div>
            )}
            <p className="text-lg font-bold text-[#1B2B4B]">{business?.name ?? "Your Business"}</p>
            {business?.abn && <p className="text-sm text-gray-500">ABN: {business.abn}</p>}
            {business?.phone && <p className="text-sm text-gray-500">{business.phone}</p>}
            {business?.email && <p className="text-sm text-gray-500">{business.email}</p>}
            {business?.address && <p className="text-sm text-gray-500">{business.address}</p>}
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-extrabold text-[#1B2B4B] mb-1">TAX INVOICE</h1>
            <p className="text-lg font-semibold text-amber-600">{inv.invoiceNumber}</p>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Date:</span> {format(new Date(inv.createdAt), "dd MMM yyyy")}</p>
              {inv.dueDate && (
                <p><span className="font-medium">Due:</span> {format(new Date(inv.dueDate), "dd MMM yyyy")}</p>
              )}
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${
                  inv.status === "paid" ? "bg-green-100 text-green-700" :
                  inv.status === "overdue" ? "bg-red-100 text-red-600" :
                  inv.status === "sent" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-600"
                }`}>{inv.status}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-8 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bill To</p>
            {customer ? (
              <>
                <p className="font-semibold text-[#1B2B4B]">{customer.name}</p>
                {customer.company && <p className="text-sm text-gray-600">{customer.company}</p>}
                {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
                {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
                {customer.address && <p className="text-sm text-gray-600">{customer.address}</p>}
              </>
            ) : (
              <p className="text-sm text-gray-400">No customer assigned</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Job Reference</p>
            {job ? (
              <>
                <p className="font-semibold text-[#1B2B4B]">{job.title}</p>
                <p className="text-sm text-gray-600">{job.jobNumber}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No job linked</p>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1B2B4B]">{inv.title}</h2>
        </div>

        {/* Line Items */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-[#1B2B4B] text-white">
              <th className="text-left px-4 py-2.5 text-sm font-semibold rounded-tl-lg">Description</th>
              <th className="text-right px-4 py-2.5 text-sm font-semibold">Qty</th>
              <th className="text-right px-4 py-2.5 text-sm font-semibold">Unit Price</th>
              <th className="text-right px-4 py-2.5 text-sm font-semibold rounded-tr-lg">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item: any, i: number) => (
              <tr key={item.id ?? i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <p className="font-medium">{item.description}</p>
                  {item.notes && <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">${parseFloat(item.unitPrice ?? "0").toFixed(2)}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${parseFloat(item.total ?? "0").toFixed(2)}</td>
              </tr>
            ))}
            {lineItems.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">No line items</td></tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {taxRate2 > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST ({inv.taxRate}%)</span>
                <span>${gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#1B2B4B] border-t border-gray-200 pt-2">
              <span>Total {taxRate2 > 0 ? "(inc. GST)" : "(ex. GST)"}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        {(business?.bankName || business?.bsb || business?.accountNumber) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-[#1B2B4B] mb-2">Payment Details</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {business.bankName && (
                <div><p className="text-xs text-gray-400">Bank</p><p className="font-medium text-gray-700">{business.bankName}</p></div>
              )}
              {business.bsb && (
                <div><p className="text-xs text-gray-400">BSB</p><p className="font-medium text-gray-700">{business.bsb}</p></div>
              )}
              {business.accountNumber && (
                <div><p className="text-xs text-gray-400">Account</p><p className="font-medium text-gray-700">{business.accountNumber}</p></div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">Reference:</span> {inv.invoiceNumber}
            </p>
          </div>
        )}

        {/* Notes */}
        {inv.notes && (
          <div className="border-t border-gray-200 pt-6 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{inv.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Thank you for your business — {business?.name ?? "FixYo"}</p>
          {business?.abn && <p className="mt-0.5">ABN: {business.abn}</p>}
          <p className="mt-0.5">Generated by FixYo — Job Management for Australian Tradespeople</p>
        </div>
      </div>
    </div>
  );
}
