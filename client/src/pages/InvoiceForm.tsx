import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

const DEFAULT_LINE_ITEM: LineItem = { description: "", quantity: "1", unitPrice: "0.00", amount: "0.00" };

function todayPlusdays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

export default function InvoiceForm() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isEdit = !!params?.id;
  const invoiceId = params?.id ? parseInt(params.id) : undefined;

  const [customerId, setCustomerId] = useState("");
  const [jobId, setJobId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dueDate, setDueDate] = useState(todayPlusdays(30));
  const [taxRate, setTaxRate] = useState("10");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...DEFAULT_LINE_ITEM }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: customers = [] } = trpc.customers.list.useQuery();
  const { data: jobs = [] } = trpc.jobs.list.useQuery();
  const { data: existing, isLoading: isLoadingInvoice } = trpc.invoices.get.useQuery(
    { id: invoiceId! },
    { enabled: isEdit && !!invoiceId }
  );

  const createMutation = trpc.invoices.create.useMutation();
  const updateMutation = trpc.invoices.update.useMutation();

  useEffect(() => {
    if (existing) {
      setCustomerId(existing.customerId?.toString() ?? "");
      setJobId(existing.jobId?.toString() ?? "");
      setInvoiceNumber(existing.invoiceNumber ?? "");
      setNotes(existing.notes ?? "");
      if (existing.dueDate) {
        setDueDate(new Date(existing.dueDate).toISOString().split("T")[0]);
      }
      if (existing.taxAmount && existing.totalAmount) {
        const total = parseFloat(String(existing.totalAmount));
        const tax = parseFloat(String(existing.taxAmount));
        if (total > 0 && tax > 0) {
          const subtotal = total - tax;
          if (subtotal > 0) {
            setTaxRate(((tax / subtotal) * 100).toFixed(0));
          }
        }
      }
      if (existing.lineItems && existing.lineItems.length > 0) {
        setLineItems(
          existing.lineItems.map((item) => ({
            description: item.description,
            quantity: String(item.quantity),
            unitPrice: String(item.unitPrice),
            amount: String(item.amount),
          }))
        );
      }
    }
  }, [existing]);

  const subtotal = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const tax = (subtotal * (parseFloat(taxRate) || 0)) / 100;
  const total = subtotal + tax;

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(updated[index].quantity) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      updated[index].amount = (qty * price).toFixed(2);
    }
    setLineItems(updated);
  };

  const addLineItem = () => setLineItems([...lineItems, { ...DEFAULT_LINE_ITEM }]);
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!invoiceNumber.trim()) {
      toast.error("Invoice number is required");
      return;
    }
    if (lineItems.every((item) => !item.description.trim())) {
      toast.error("Please add at least one line item");
      return;
    }

    try {
      setIsSubmitting(true);

      const dueDateObj = dueDate ? new Date(dueDate) : undefined;

      if (isEdit && invoiceId) {
        await updateMutation.mutateAsync({
          id: invoiceId,
          totalAmount: total.toFixed(2),
          taxAmount: tax.toFixed(2),
          dueDate: dueDateObj,
          notes: notes.trim() || undefined,
        });
        toast.success("Invoice updated successfully");
      } else {
        await createMutation.mutateAsync({
          customerId: parseInt(customerId),
          jobId: jobId ? parseInt(jobId) : undefined,
          invoiceNumber: invoiceNumber.trim(),
          totalAmount: total.toFixed(2),
          taxAmount: tax.toFixed(2),
          dueDate: dueDateObj,
          notes: notes.trim() || undefined,
          lineItems: lineItems
            .filter((item) => item.description.trim())
            .map((item) => ({
              description: item.description.trim(),
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
            })),
        });
        toast.success("Invoice created successfully");
      }

      navigate("/app/invoices");
    } catch (error) {
      console.error("Invoice form error:", error);
      toast.error(isEdit ? "Failed to update invoice" : "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoadingInvoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filteredJobs = customerId
    ? jobs.filter((j) => j.customerId === parseInt(customerId))
    : jobs;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/app/invoices")} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? "Edit Invoice" : "Create Invoice"}</h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update invoice details" : "Create a new invoice for a customer"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Customer *</label>
                <Select value={customerId} onValueChange={(v) => { setCustomerId(v); setJobId(""); }} disabled={isEdit || isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.firstName} {c.lastName}
                        {c.email ? ` (${c.email})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Invoice Number *</label>
                <Input
                  placeholder="INV-001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  disabled={isEdit || isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Linked Job (optional)</label>
                <Select value={jobId} onValueChange={setJobId} disabled={isEdit || isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {filteredJobs.map((j) => (
                      <SelectItem key={j.id} value={j.id.toString()}>
                        {j.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">GST Rate (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="10"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Textarea
                placeholder="Payment terms, bank details, or any other notes for the customer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              {!isEdit && (
                <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-2" disabled={isSubmitting}>
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24 text-right">Qty</TableHead>
                    <TableHead className="w-28 text-right">Unit Price</TableHead>
                    <TableHead className="w-28 text-right">Amount</TableHead>
                    {!isEdit && <TableHead className="w-12" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {isEdit ? (
                          <span className="text-sm">{item.description}</span>
                        ) : (
                          <Input
                            placeholder="Service or product description"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, "description", e.target.value)}
                            className="border-0 px-0 h-8"
                            disabled={isSubmitting}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEdit ? (
                          <span className="text-sm">{parseFloat(item.quantity).toFixed(2)}</span>
                        ) : (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                            className="border-0 px-0 text-right h-8"
                            disabled={isSubmitting}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEdit ? (
                          <span className="text-sm">${parseFloat(item.unitPrice).toFixed(2)}</span>
                        ) : (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, "unitPrice", e.target.value)}
                            className="border-0 px-0 text-right h-8"
                            disabled={isSubmitting}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${parseFloat(item.amount).toFixed(2)}
                      </TableCell>
                      {!isEdit && (
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1 || isSubmitting}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST ({taxRate || 0}%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/app/invoices")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
