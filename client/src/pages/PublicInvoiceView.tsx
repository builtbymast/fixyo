import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function PublicInvoiceView() {
  const params = useParams<{ token: string }>();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const token = params?.token || "";

  // Fetch invoice by public token
  const { data: invoiceData, isLoading, error } = trpc.invoices.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const initiatePaymentMutation = trpc.invoices.initiatePayment.useMutation();

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
      const result = await initiatePaymentMutation.mutateAsync({
        token,
        origin: window.location.origin,
      });
      
      if (result.checkoutUrl) {
        toast.success("Redirecting to payment page...");
        window.open(result.checkoutUrl, "_blank");
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error processing payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-accent" />
          <p className="text-lg text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invoice Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The invoice link you're trying to access is invalid or has expired.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact your service provider for a new invoice link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = invoiceData.status === "paid";
  const isOverdue = invoiceData.status === "overdue";
  const totalAmount = invoiceData.lineItems
    ?.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0)
    .toFixed(2) || "0.00";

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    viewed: "bg-blue-100 text-blue-800",
    partially_paid: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary">Invoice</h1>
          <p className="text-muted-foreground">
            Invoice #{invoiceData.invoiceNumber || `INV-${invoiceData.id}`}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge className={statusColors[invoiceData.status] || "bg-gray-100"}>
            {invoiceData.status === "paid" && "✓ Paid"}
            {invoiceData.status === "overdue" && "⚠ Overdue"}
            {invoiceData.status === "partially_paid" && "◐ Partially Paid"}
            {invoiceData.status === "sent" && "📧 Sent"}
            {invoiceData.status === "viewed" && "👁 Viewed"}
            {invoiceData.status === "draft" && "📝 Draft"}
            {invoiceData.status === "cancelled" && "✕ Cancelled"}
          </Badge>

          {isPaid && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Payment received
            </span>
          )}

          {isOverdue && (
            <span className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              This invoice is overdue
            </span>
          )}
        </div>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer & Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Bill To
                </h3>
                <div className="space-y-1">
                  <p className="font-medium">
                    {invoiceData.customer?.firstName} {invoiceData.customer?.lastName}
                  </p>
                  {invoiceData.customer?.email && (
                    <p className="text-sm text-muted-foreground">
                      {invoiceData.customer.email}
                    </p>
                  )}
                  {invoiceData.customer?.phone && (
                    <p className="text-sm text-muted-foreground">
                      {invoiceData.customer.phone}
                    </p>
                  )}
                  {invoiceData.customer?.address && (
                    <p className="text-sm text-muted-foreground">
                      {invoiceData.customer.address}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Invoice Information
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {new Date(invoiceData.createdAt).toLocaleDateString()}
                  </p>
                  {invoiceData.dueDate && (
                    <p>
                      <span className="text-muted-foreground">Due Date:</span>{" "}
                      {new Date(invoiceData.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {invoiceData.paidDate && (
                    <p>
                      <span className="text-muted-foreground">Paid Date:</span>{" "}
                      {new Date(invoiceData.paidDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            {invoiceData.lineItems && invoiceData.lineItems.length > 0 && (
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
                      {invoiceData.lineItems.map((item, idx) => (
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
              <div className="space-y-2 w-full max-w-xs border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${totalAmount}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Due:</span>
                  <span className="text-accent">${totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoiceData.notes && (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {invoiceData.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Section */}
        {!isPaid && invoiceData.status !== "cancelled" && (
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                <div>
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="text-3xl font-bold text-accent">${totalAmount}</p>
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  size="lg"
                  className="gap-2"
                >
                  {isProcessingPayment && <Loader2 className="h-4 w-4 animate-spin" />}
                  <CreditCard className="h-4 w-4" />
                  Pay Now
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Your payment is processed securely. We accept all major credit and debit cards.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Paid Confirmation */}
        {isPaid && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">Payment Received</h3>
                  <p className="text-sm text-green-800 mt-1">
                    Thank you for your payment. Your invoice has been marked as paid.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.print()}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-6">
          <p>
            If you have any questions about this invoice, please contact the service provider.
          </p>
        </div>
      </div>
    </div>
  );
}
