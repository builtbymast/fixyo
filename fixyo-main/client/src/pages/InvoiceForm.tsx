import { useState } from "react";
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

export default function InvoiceForm() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isEdit = !!params?.id;

  // Form state
  const [customerId, setCustomerId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [taxRate, setTaxRate] = useState<string>("0");
  const [discountAmount, setDiscountAmount] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: "1", unitPrice: "0", amount: "0" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API calls
  const { data: customers } = trpc.customers.list.useQuery();
  const createInvoiceMutation = trpc.invoices.create.useMutation();

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    return sum + amount;
  }, 0);

  const tax = (subtotal * parseFloat(taxRate || "0")) / 100;
  const discount = parseFloat(discountAmount || "0");
  const total = subtotal + tax - discount;

  // Line item handlers
  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;

    // Auto-calculate amount if quantity or price changed
    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].amount = (qty * price).toFixed(2);
    }

    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: "1", unitPrice: "0", amount: "0" }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (!invoiceNumber) {
      toast.error("Please enter an invoice number");
      return;
    }

    if (lineItems.length === 0 || lineItems.every((item) => !item.description)) {
      toast.error("Please add at least one line item");
      return;
    }

    try {
      setIsSubmitting(true);

      await createInvoiceMutation.mutateAsync({
        customerId: parseInt(customerId),
        invoiceNumber,
        totalAmount: total.toFixed(2),
        taxAmount: tax.toFixed(2),
        notes,
        lineItems: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      });

      toast.success("Invoice created successfully!");
      navigate("/app/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/invoices")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {isEdit ? "Edit Invoice" : "Create Invoice"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Update invoice details" : "Create a new invoice for a customer"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer & Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Customer *</label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName}
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tax Rate (%)</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Discount Amount ($)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  placeholder="Add any additional notes or terms..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20 text-right">Qty</TableHead>
                      <TableHead className="w-24 text-right">Unit Price</TableHead>
                      <TableHead className="w-24 text-right">Amount</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            placeholder="Service description"
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(index, "description", e.target.value)
                            }
                            className="border-0 px-0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(index, "quantity", e.target.value)
                            }
                            className="border-0 px-0 text-right"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateLineItem(index, "unitPrice", e.target.value)
                            }
                            className="border-0 px-0 text-right"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${parseFloat(item.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end">
                <div className="space-y-2 w-full max-w-xs">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {parseFloat(taxRate) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(discountAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount:</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-accent">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/invoices")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Update Invoice" : "Create Invoice"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
