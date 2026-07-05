import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import SignatureCapture from "@/components/SignatureCapture";

export default function PublicQuoteView() {
  const params = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = params?.token || "";

  // Fetch quote by public token
  const { data: quoteData, isLoading, error } = trpc.quotes.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const signMutation = trpc.quotes.sign.useMutation();

  const handleSignatureCapture = (signature: string) => {
    setSignatureData(signature);
    toast.success("Signature captured!");
  };

  const handleSubmitSignature = async () => {
    if (!signatureData || !quoteData?.id) {
      toast.error("Please sign the quote first");
      return;
    }

    setIsSubmitting(true);
    try {
      await signMutation.mutateAsync({
        token,
        signedByName: quoteData.customer?.firstName + " " + quoteData.customer?.lastName || "Customer",
        signatureUrl: signatureData,
      });

      toast.success("Quote signed successfully!");
      setTimeout(() => {
        setLocation("/public/quote-signed");
      }, 2000);
    } catch (err) {
      console.error("Signature submission error:", err);
      toast.error("Failed to sign quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-accent" />
          <p className="text-lg text-muted-foreground">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quoteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Quote Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The quote link you're trying to access is invalid or has expired.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact your service provider for a new quote link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSigned = quoteData.status === "signed";

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary">Quote</h1>
          <p className="text-muted-foreground">
            Quote #{quoteData.quoteNumber || `QT-${quoteData.id}`}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant={isSigned ? "default" : "secondary"}
            className={isSigned ? "bg-green-600" : ""}
          >
            {isSigned ? "✓ Signed" : "Pending Signature"}
          </Badge>
          {isSigned && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              This quote has been signed
            </span>
          )}
        </div>

        {/* Quote Details */}
        <Card>
          <CardHeader>
            <CardTitle>Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Bill To
                </h3>
                <div className="space-y-1">
                  <p className="font-medium">
                    {quoteData.customer?.firstName} {quoteData.customer?.lastName}
                  </p>
                  {quoteData.customer?.email && (
                    <p className="text-sm text-muted-foreground">
                      {quoteData.customer.email}
                    </p>
                  )}
                  {quoteData.customer?.phone && (
                    <p className="text-sm text-muted-foreground">
                      {quoteData.customer.phone}
                    </p>
                  )}
                  {quoteData.customer?.address && (
                    <p className="text-sm text-muted-foreground">
                      {quoteData.customer.address}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Quote Information
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {new Date(quoteData.createdAt).toLocaleDateString()}
                  </p>
                  {quoteData.validUntil && (
                    <p>
                      <span className="text-muted-foreground">Valid Until:</span>{" "}
                      {new Date(quoteData.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            {quoteData.lineItems && quoteData.lineItems.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Services</h3>
                <div className="overflow-x-auto">
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
                      {quoteData.lineItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            ${parseFloat(item.unitPrice.toString()).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${parseFloat(item.amount.toString()).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="flex justify-end">
              <div className="space-y-2 w-full max-w-xs">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>
                    $
                    {quoteData.lineItems
                      ?.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-accent">
                    $
                    {quoteData.lineItems
                      ?.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Section */}
        {!isSigned && (
          <>
            <SignatureCapture
              onSignatureCapture={handleSignatureCapture}
              disabled={isSubmitting}
            />

            <div className="flex gap-4">
              <Button
                onClick={handleSubmitSignature}
                disabled={!signatureData || isSubmitting}
                className="flex-1"
                size="lg"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign & Accept Quote
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => window.print()}
              >
                <Download className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </>
        )}

        {/* Already Signed Message */}
        {isSigned && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">Quote Signed</h3>
                  <p className="text-sm text-green-800 mt-1">
                    Thank you for signing this quote. We'll be in touch shortly to confirm the work.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-6">
          <p>
            If you have any questions about this quote, please contact the service provider.
          </p>
        </div>
      </div>
    </div>
  );
}
