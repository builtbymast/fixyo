import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Pencil, Send, Loader2, Download, Link as LinkIcon } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

const quoteStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-cyan-100 text-cyan-800",
  signed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-500",
};

const quoteStatusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  signed: "Signed",
  rejected: "Rejected",
  expired: "Expired",
};

function fmtMoney(v: unknown): string {
  const n = parseFloat(String(v));
  return isNaN(n) ? "0.00" : n.toFixed(2);
}

export default function QuoteDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const quoteId = params?.id ? parseInt(params.id) : undefined;

  const { data: quote, isLoading: isLoadingQuote } = trpc.quotes.get.useQuery(
    { id: quoteId! },
    { enabled: !!quoteId }
  );
  const { data: customer } = trpc.customers.get.useQuery(
    { id: quote?.customerId! },
    { enabled: !!quote?.customerId }
  );
  const { data: business } = trpc.business.get.useQuery();

  const sendEmailMutation = trpc.quotes.sendEmail.useMutation();

  const handleSendEmail = async () => {
    if (!quoteId) return;
    try {
      const result = await sendEmailMutation.mutateAsync({
        id: quoteId,
        origin: window.location.origin,
      });
      if (result.success) {
        toast.success("Quote sent to customer");
      } else {
        toast.error(result.message || "Failed to send quote");
      }
    } catch (error) {
      console.error("Send quote error:", error);
      toast.error("Failed to send quote");
    }
  };

  const handleCopyLink = () => {
    if (!quote?.publicToken) return;
    const link = `${window.location.origin}/portal/quote/${quote.publicToken}`;
    navigator.clipboard.writeText(link);
    toast.success("Portal link copied to clipboard");
  };

  if (isLoadingQuote) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/quotes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Quote Not Found</h1>
        </div>
      </div>
    );
  }

  const totalAmount = parseFloat(String(quote.totalAmount));
  const taxAmount = parseFloat(String(quote.taxAmount ?? 0));
  const subtotal = totalAmount - taxAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/quotes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{quote.quoteNumber}</h1>
            <p className="text-muted-foreground mt-1">Quote #{quote.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {quote.publicToken && (
            <Button variant="outline" onClick={handleCopyLink} className="gap-2">
              <LinkIcon className="h-4 w-4" />
              Copy Link
            </Button>
          )}
          <Button variant="outline" asChild className="gap-2">
            <a href={`/api/pdf/quote/${quote.id}`} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </Button>
          <Button variant="outline" onClick={handleSendEmail} disabled={sendEmailMutation.isPending} className="gap-2">
            {sendEmailMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send to Customer
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation(`/app/quotes/${quote.id}/edit`)}
            className="gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={quoteStatusColors[quote.status]}>
                {quoteStatusLabels[quote.status]}
              </Badge>
            </div>
            {quote.validUntil && (
              <p className="text-sm text-muted-foreground">
                Valid until: {new Date(quote.validUntil).toLocaleDateString()}
              </p>
            )}
            {quote.signedDate && (
              <p className="text-sm text-muted-foreground">
                Signed: {new Date(quote.signedDate).toLocaleDateString()}
                {quote.signedByName ? ` by ${quote.signedByName}` : ""}
              </p>
            )}
            {quote.signatureUrl && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Signature</p>
                <img
                  src={quote.signatureUrl}
                  alt="Customer signature"
                  className="max-h-24 border rounded-md bg-white"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote For</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {customer ? (
              <>
                <p className="text-sm font-medium">
                  {customer.firstName} {customer.lastName}
                </p>
                {customer.email && <p className="text-sm text-muted-foreground">{customer.email}</p>}
                {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
                {customer.address && (
                  <p className="text-sm text-muted-foreground">
                    {customer.address}
                    {customer.suburb ? `, ${customer.suburb}` : ""}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Loading customer…</p>
            )}
            {business && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">From: {business.businessName}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.lineItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell className="text-right">{fmtMoney(item.quantity)}</TableCell>
                  <TableCell className="text-right">${fmtMoney(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">${fmtMoney(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {(quote.notes || quote.terms) && (
        <Card>
          <CardHeader>
            <CardTitle>Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quote.notes && (
              <div>
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
            {quote.terms && (
              <div>
                <p className="text-sm font-medium mb-1">Terms</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.terms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
