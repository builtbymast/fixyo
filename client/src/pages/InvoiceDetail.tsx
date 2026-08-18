import { trpc } from "@/lib/trpc";
import { openAuthedDownload } from "@/lib/authedDownload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Pencil, Send, Loader2, Download } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

const invoiceStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-cyan-100 text-cyan-800",
  partially_paid: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
};

const invoiceStatusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

function fmtMoney(v: unknown): string {
  const n = parseFloat(String(v));
  return isNaN(n) ? "0.00" : n.toFixed(2);
}

export default function InvoiceDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const invoiceId = params?.id ? parseInt(params.id) : undefined;

  const { data: invoice, isLoading: isLoadingInvoice } = trpc.invoices.get.useQuery(
    { id: invoiceId! },
    { enabled: !!invoiceId }
  );
  const { data: customer } = trpc.customers.get.useQuery(
    { id: invoice?.customerId! },
    { enabled: !!invoice?.customerId }
  );
  const { data: business } = trpc.business.get.useQuery();

  const sendEmailMutation = trpc.invoices.sendEmail.useMutation();

  const handleSendEmail = async () => {
    if (!invoiceId) return;
    try {
      const result = await sendEmailMutation.mutateAsync({
        id: invoiceId,
        origin: window.location.origin,
      });
      if (result.success) {
        toast.success("Invoice sent to customer");
      } else {
        toast.error(result.message || "Failed to send invoice");
      }
    } catch (error) {
      console.error("Send invoice error:", error);
      toast.error("Failed to send invoice");
    }
  };

  if (isLoadingInvoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Invoice Not Found</h1>
        </div>
      </div>
    );
  }

  const totalAmount = parseFloat(String(invoice.totalAmount));
  const taxAmount = parseFloat(String(invoice.taxAmount ?? 0));
  const paidAmount = parseFloat(String(invoice.paidAmount ?? 0));
  const subtotal = totalAmount - taxAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/invoices")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground mt-1">Invoice #{invoice.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => openAuthedDownload(`/api/pdf/invoice/${invoice.id}`)}
          >
            <Download className="h-4 w-4" />
            Download PDF
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
            onClick={() => setLocation(`/app/invoices/${invoice.id}/edit`)}
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
              <Badge className={invoiceStatusColors[invoice.status]}>
                {invoiceStatusLabels[invoice.status]}
              </Badge>
            </div>
            {invoice.dueDate && (
              <p className="text-sm text-muted-foreground">
                Due: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            )}
            {invoice.paidDate && (
              <p className="text-sm text-muted-foreground">
                Paid: {new Date(invoice.paidDate).toLocaleDateString()}
              </p>
            )}
            {paidAmount > 0 && (
              <p className="text-sm text-muted-foreground">
                Paid amount: ${fmtMoney(invoice.paidAmount)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
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
              {invoice.lineItems?.map((item) => (
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

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
