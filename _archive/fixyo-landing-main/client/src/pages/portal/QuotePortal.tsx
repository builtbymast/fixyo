import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle, Wrench } from "lucide-react";
import { useParams } from "wouter";
import { useState } from "react";

export default function QuotePortal() {
  const { token } = useParams<{ token: string }>();
  const { data: quote, isLoading, error } = trpc.quotes.getPublic.useQuery({ token: token ?? "" }, { enabled: !!token });
  const [signed, setSigned] = useState(false);
  const [signerName, setSignerName] = useState("");
  const sign = trpc.quotes.sign.useMutation({
    onSuccess: () => { setSigned(true); toast.success("Quote accepted! The tradie will be in touch."); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
      <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
    </div>
  );

  if (error || !quote) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
      <Card className="max-w-md w-full mx-4 border-0 shadow-lg">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Quote not found or link has expired.</p>
        </CardContent>
      </Card>
    </div>
  );

  const subtotal = parseFloat(quote.subtotal ?? "0");
  const taxAmount = parseFloat(quote.taxAmount ?? "0");
  const total = parseFloat(quote.total ?? "0");
  const isAccepted = quote.status === "accepted" || signed;

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-['Sora'] text-2xl font-extrabold">
            <span className="text-[#1B2B4B]">Fix</span><span className="text-amber-500">Yo</span>
          </span>
        </div>

        <Card className="border-0 shadow-lg mb-4">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl text-[#1B2B4B]">{quote.title}</CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  {quote.quoteNumber} · {format(new Date(quote.createdAt), "dd MMM yyyy")}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isAccepted ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {isAccepted ? "Accepted" : quote.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {quote.notes && (
              <div>
                <p className="text-sm font-medium text-[#1B2B4B] mb-1">Notes</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-[#1B2B4B] mb-3">Scope of Work</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-400 font-medium">Description</th>
                    <th className="text-right py-2 text-gray-400 font-medium">Qty</th>
                    <th className="text-right py-2 text-gray-400 font-medium">Unit Price</th>
                    <th className="text-right py-2 text-gray-400 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(quote.lineItems ?? []).map((item: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-[#1B2B4B]">{item.description}</td>
                      <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-600">${parseFloat(String(item.unitPrice)).toFixed(2)}</td>
                      <td className="py-2 text-right font-medium">
                        ${(parseFloat(String(item.quantity)) * parseFloat(String(item.unitPrice))).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>GST ({quote.taxRate ?? "10"}%)</span><span>${taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-[#1B2B4B] text-lg pt-2 border-t border-gray-200">
                  <span>Total (inc. GST)</span><span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {quote.terms && (
              <div>
                <p className="text-sm font-medium text-[#1B2B4B] mb-1">Terms & Conditions</p>
                <p className="text-xs text-gray-500 whitespace-pre-wrap">{quote.terms}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {isAccepted ? (
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Quote Accepted</p>
                <p className="text-sm text-green-600">The tradie has been notified and will be in touch shortly.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Enter your name to accept this quote and agree to the scope of work and pricing above.</p>
              <div>
                <Label>Your Full Name</Label>
                <Input
                  value={signerName}
                  onChange={e => setSignerName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => sign.mutate({ token: token ?? "", signedByName: signerName, signatureBase64: signerName })}
                disabled={sign.isPending || !signerName.trim()}
                className="w-full bg-[#1B2B4B] hover:bg-[#243a63] text-white py-3 text-base font-semibold"
              >
                {sign.isPending ? "Processing..." : "✓ Accept Quote"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
