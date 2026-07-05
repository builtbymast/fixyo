import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function QuoteForm() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [customerId, setCustomerId] = useState<number>(0);
  const [quoteNumber, setQuoteNumber] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(10);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const { data: customers = [] } = trpc.customers.list.useQuery();
  const createMutation = trpc.quotes.create.useMutation();

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (lineItems.some((item) => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      toast.error("Please fill in all line item details");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createMutation.mutateAsync({
        customerId,
        quoteNumber: quoteNumber || "",
        totalAmount: total.toString(),
        lineItems: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          amount: (item.quantity * item.unitPrice).toString(),
        })),
        notes,
      });

      // Line items are handled server-side during quote creation

      toast.success("Quote created successfully");
      setLocation("/app/quotes");
    } catch (error) {
      console.error("Quote form error:", error);
      toast.error("Failed to create quote");
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const afterDiscount = subtotal - discountAmount;
  const tax = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + tax;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/app/quotes")}
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create Quote</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Customer *</label>
                <Select value={customerId.toString()} onValueChange={(val) => setCustomerId(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.firstName} {customer.lastName} ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quote Number (Optional)</label>
                <Input
                  placeholder="Auto-generated if empty"
                  value={quoteNumber}
                  onChange={(e) => setQuoteNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Quote description or scope of work"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                placeholder="Terms, conditions, or additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Total</label>
                <div className="text-2xl font-bold text-accent pt-2">
                  ${total.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Quote
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/app/quotes")}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Button type="button" size="sm" onClick={addLineItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        className="text-right"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="text-right"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax ({taxRate}%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-accent">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Add multiple line items for different services or products</p>
          <p>• Quantities and unit prices are automatically calculated</p>
          <p>• Adjust tax rate and discount for the entire quote</p>
          <p>• Quote number is auto-generated if left empty</p>
          <p>• You can download as PDF after creating the quote</p>
        </CardContent>
      </Card>
    </div>
  );
}
