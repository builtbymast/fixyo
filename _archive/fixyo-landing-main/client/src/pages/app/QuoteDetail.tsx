import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle, Copy, Edit, Send } from "lucide-react";
import { Link, useParams } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-amber-100 text-amber-700",
  viewed: "bg-cyan-100 text-cyan-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-600",
};

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const quoteId = parseInt(id ?? "0");
  const utils = trpc.useUtils();

  const { data: quote, isLoading } = trpc.quotes.get.useQuery({ id: quoteId }, { enabled: !!quoteId });
  const send = trpc.quotes.send.useMutation({
    onSuccess: ({ publicToken }) => {
      utils.quotes.get.invalidate({ id: quoteId });
      const url = `${window.location.origin}/portal/quote/${publicToken}`;
      navigator.clipboard.writeText(url).then(() => toast.success("Quote sent! Portal link copied to clipboard."));
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return <AppLayout title="Quote"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/3" /><div className="h-40 bg-gray-200 rounded-xl" /></div></AppLayout>;
  }
  if (!quote) {
    return <AppLayout title="Quote Not Found"><p className="text-gray-500">Quote not found.</p><Link href="/app/quotes"><Button className="mt-4">Back to Quotes</Button></Link></AppLayout>;
  }

  const portalUrl = `${window.location.origin}/portal/quote/${quote.publicToken}`;

  return (
    <AppLayout title={quote.title}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/quotes"><Button variant="ghost" size="sm" className="gap-1 text-gray-500"><ArrowLeft className="w-4 h-4" /> Quotes</Button></Link>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[quote.status] ?? "bg-gray-100 text-gray-600"}`}>{quote.status}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base text-[#1B2B4B]">Quote Details</CardTitle>
              <Link href={`/app/quotes/${quote.id}/edit`}>
                <Button size="sm" variant="outline" className="gap-1"><Edit className="w-3 h-3" /> Edit</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Quote Number</span><p className="font-medium text-[#1B2B4B]">{quote.quoteNumber}</p></div>
                <div><span className="text-gray-400">Created</span><p className="font-medium text-[#1B2B4B]">{format(new Date(quote.createdAt), "dd MMM yyyy")}</p></div>
                {quote.validUntil && <div><span className="text-gray-400">Valid Until</span><p className="font-medium text-[#1B2B4B]">{format(new Date(quote.validUntil), "dd MMM yyyy")}</p></div>}
                {quote.acceptedAt && <div><span className="text-gray-400">Accepted</span><p className="font-medium text-green-600">{format(new Date(quote.acceptedAt), "dd MMM yyyy")}</p></div>}
              </div>
              {quote.notes && <div className="pt-2 border-t border-gray-100"><p className="text-xs text-gray-400 mb-1">Notes</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p></div>}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Line Items</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100"><th className="text-left py-2 text-gray-400 font-medium">Description</th><th className="text-right py-2 text-gray-400 font-medium">Qty</th><th className="text-right py-2 text-gray-400 font-medium">Unit Price</th><th className="text-right py-2 text-gray-400 font-medium">Total</th></tr></thead>
                  <tbody>
                    {(quote.lineItems ?? []).map((item, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-2 text-[#1B2B4B]">{item.description}</td>
                        <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                        <td className="py-2 text-right text-gray-600">${parseFloat(String(item.unitPrice)).toFixed(2)}</td>
                        <td className="py-2 text-right font-medium text-[#1B2B4B]">${(parseFloat(String(item.quantity)) * parseFloat(String(item.unitPrice))).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${parseFloat(quote.subtotal ?? "0").toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>GST ({quote.taxRate ?? "10"}%)</span><span>${parseFloat(quote.taxAmount ?? "0").toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-[#1B2B4B] text-base pt-2 border-t border-gray-200"><span>Total</span><span>${parseFloat(quote.total ?? "0").toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>

          {quote.signedByName && (
            <Card className="border-0 shadow-sm bg-green-50">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Signed by {quote.signedByName}</p>
                  {quote.signedAt && <p className="text-sm text-green-600">{format(new Date(quote.signedAt), "dd MMM yyyy 'at' h:mm a")}</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {quote.status === "draft" && (
                <Button onClick={() => send.mutate({ id: quote.id })} disabled={send.isPending} className="w-full bg-[#1B2B4B] text-white gap-2">
                  <Send className="w-4 h-4" /> {send.isPending ? "Sending..." : "Send to Customer"}
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full gap-2 text-sm"
                onClick={() => { navigator.clipboard.writeText(portalUrl); toast.success("Portal link copied!"); }}
              >
                <Copy className="w-4 h-4" /> Copy Portal Link
              </Button>
              <Link href={`/app/invoices/new?quoteId=${quote.id}`}>
                <Button variant="outline" className="w-full gap-2 text-sm">Convert to Invoice</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm text-[#1B2B4B]">Customer Portal Link</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400 break-all">{portalUrl}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
