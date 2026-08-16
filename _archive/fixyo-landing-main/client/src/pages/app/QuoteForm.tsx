import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Bot, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearch } from "wouter";

interface LineItem { description: string; quantity: string; unitPrice: string; unit: string; taxable: boolean; }
const emptyItem = (): LineItem => ({ description: "", quantity: "1", unitPrice: "", unit: "each", taxable: true });

export default function QuoteForm() {
  const { id } = useParams<{ id: string }>();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [, setLocation] = useLocation();
  const isEdit = !!id;
  const quoteId = parseInt(id ?? "0");
  const utils = trpc.useUtils();

  const { data: existing } = trpc.quotes.get.useQuery({ id: quoteId }, { enabled: isEdit && !!quoteId });
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: business } = trpc.business.get.useQuery();
  const generateItems = trpc.ai.generateLineItems.useMutation();
  const generateText = trpc.ai.generateQuoteText.useMutation();

  const [form, setForm] = useState({ title: "", notes: "", terms: "", taxRate: "10", customerId: "", jobId: "" });
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);

  useEffect(() => {
    if (existing) {
      setForm({ title: existing.title, notes: existing.notes ?? "", terms: existing.terms ?? "", taxRate: existing.taxRate ?? "10", customerId: String(existing.customerId ?? ""), jobId: String(existing.jobId ?? "") });
      if (existing.lineItems?.length) setItems(existing.lineItems.map((i: any) => ({ description: i.description, quantity: String(i.quantity), unitPrice: String(i.unitPrice), unit: i.unit ?? "each", taxable: i.taxable })));
    } else {
      const jobId = params.get("jobId");
      if (jobId) setForm(f => ({ ...f, jobId }));
      if (business?.taxRate) setForm(f => ({ ...f, taxRate: business.taxRate ?? "10" }));
    }
  }, [existing, business]);

  const taxRate = parseFloat(form.taxRate || "10");
  const subtotal = items.reduce((s, i) => s + (parseFloat(i.quantity || "0") * parseFloat(i.unitPrice || "0")), 0);
  const tax = items.reduce((s, i) => i.taxable ? s + parseFloat(i.quantity || "0") * parseFloat(i.unitPrice || "0") * (taxRate / 100) : s, 0);
  const total = subtotal + tax;

  const create = trpc.quotes.create.useMutation({ onSuccess: ({ id }: { id: number }) => { toast.success("Quote created!"); setLocation(`/app/quotes/${id}`); }, onError: (e: any) => toast.error(e.message) });
  const update = trpc.quotes.update.useMutation({ onSuccess: () => { toast.success("Quote updated!"); utils.quotes.get.invalidate({ id: quoteId }); setLocation(`/app/quotes/${quoteId}`); }, onError: (e: any) => toast.error(e.message) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, customerId: form.customerId ? Number(form.customerId) : undefined, jobId: form.jobId ? Number(form.jobId) : undefined, lineItems: items };
    if (isEdit) update.mutate({ id: quoteId, ...payload });
    else create.mutate(payload);
  };

  const addItem = () => setItems(i => [...i, emptyItem()]);
  const removeItem = (idx: number) => setItems(i => i.filter((_, j) => j !== idx));
  const updateItem = (idx: number, field: keyof LineItem, val: string | boolean) => setItems(i => i.map((item, j) => j === idx ? { ...item, [field]: val } : item));

  const handleAiItems = async () => {
    if (!form.title) { toast.error("Enter a job title first"); return; }
    try {
      const res = await generateItems.mutateAsync({ tradeType: business?.tradeType ?? "trade", jobDescription: form.title });
      if (res.items.length) setItems(res.items.map((i: any) => ({ description: i.description, quantity: String(i.quantity), unitPrice: String(i.unitPrice), unit: i.unit, taxable: true })));
      toast.success("AI line items generated!");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAiNotes = async () => {
    if (!form.title) { toast.error("Enter a job title first"); return; }
    try {
      const res = await generateText.mutateAsync({ tradeType: business?.tradeType ?? "trade", jobTitle: form.title, lineItemsSummary: items.map(i => i.description).join(", ") });
      setForm(f => ({ ...f, notes: res.text }));
      toast.success("AI notes generated!");
    } catch (e: any) { toast.error(e.message); }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <AppLayout title={isEdit ? "Edit Quote" : "New Quote"}>
      <div className="flex items-center gap-3 mb-6">
        <Link href={isEdit ? `/app/quotes/${quoteId}` : "/app/quotes"}>
          <Button variant="ghost" size="sm" className="gap-1 text-gray-500"><ArrowLeft className="w-4 h-4" /> Back</Button>
        </Link>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Quote Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Bathroom renovation quote" required className="mt-1" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Notes for Customer</Label>
                    <Button type="button" size="sm" variant="ghost" className="gap-1 text-amber-600 text-xs" onClick={handleAiNotes} disabled={generateText.isPending}>
                      <Bot className="w-3 h-3" /> AI Generate
                    </Button>
                  </div>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes visible to the customer..." rows={3} />
                </div>
                <div>
                  <Label>Terms & Conditions</Label>
                  <Textarea value={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.value }))} placeholder="Payment terms, warranty, etc." rows={2} className="mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base text-[#1B2B4B]">Line Items</CardTitle>
                <Button type="button" size="sm" variant="ghost" className="gap-1 text-amber-600 text-xs" onClick={handleAiItems} disabled={generateItems.isPending}>
                  <Bot className="w-3 h-3" /> AI Suggest Items
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Desktop header */}
                <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium px-1">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Unit $</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1" />
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center border sm:border-0 rounded-lg sm:rounded-none p-3 sm:p-0 bg-gray-50 sm:bg-transparent">
                    <div className="sm:col-span-5">
                      <label className="text-xs text-gray-400 sm:hidden">Description</label>
                      <Input placeholder="Description" value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:contents">
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-400 sm:hidden">Qty</label>
                        <Input placeholder="1" type="number" min="0" step="0.01" value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-400 sm:hidden">Unit $</label>
                        <Input placeholder="0.00" type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, "unitPrice", e.target.value)} />
                      </div>
                      <div className="sm:col-span-2 flex sm:justify-end items-end sm:items-center">
                        <div className="text-sm font-medium text-[#1B2B4B]">${(parseFloat(item.quantity || "0") * parseFloat(item.unitPrice || "0")).toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1 h-auto"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1 mt-2 text-xs"><Plus className="w-3 h-3" /> Add Item</Button>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>GST ({form.taxRate}%)</span><span>${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-[#1B2B4B] text-base pt-2 border-t border-gray-200"><span>Total (inc. GST)</span><span>${total.toFixed(2)}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Customer</Label>
                  <Select value={form.customerId} onValueChange={v => setForm(f => ({ ...f, customerId: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No customer</SelectItem>
                      {(customers ?? []).map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>GST Rate (%)</Label>
                  <Input type="number" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: e.target.value }))} className="mt-1" />
                </div>
              </CardContent>
            </Card>
            <Button type="submit" disabled={isPending} className="w-full bg-[#1B2B4B] hover:bg-[#243a63] text-white gap-2">
              <Save className="w-4 h-4" /> {isPending ? "Saving..." : isEdit ? "Update Quote" : "Create Quote"}
            </Button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
