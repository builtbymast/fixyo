import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
export const TRADE_TYPES = ["Plumbing", "Electrical", "Carpentry", "Painting", "Roofing", "HVAC", "Landscaping", "Masonry", "Welding", "Tiling", "Flooring"];

export default function JobForm() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const isEdit = !!id;
  const jobId = parseInt(id ?? "0");
  const utils = trpc.useUtils();

  const { data: existingJob } = trpc.jobs.get.useQuery({ id: jobId }, { enabled: isEdit && !!jobId });
  const { data: customers } = trpc.customers.list.useQuery();

  const [form, setForm] = useState({
    title: "",
    description: "",
    tradeType: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "active" as "draft" | "active" | "completed" | "invoiced" | "cancelled",
    siteAddress: "",
    notes: "",
    internalNotes: "",
    customerId: "" as string | number,
    estimatedHours: "",
  });

  useEffect(() => {
    if (existingJob) {
      setForm({
        title: existingJob.title,
        description: existingJob.description ?? "",
        tradeType: existingJob.tradeType ?? "",
        priority: (existingJob.priority as any) ?? "medium",
        status: existingJob.status as any,
        siteAddress: existingJob.siteAddress ?? "",
        notes: existingJob.notes ?? "",
        internalNotes: existingJob.internalNotes ?? "",
        customerId: existingJob.customerId ?? "",
        estimatedHours: existingJob.estimatedHours ?? "",
      });
    }
  }, [existingJob]);

  const createJob = trpc.jobs.create.useMutation({
    onSuccess: ({ id }) => { toast.success("Job created!"); setLocation(`/app/jobs/${id}`); },
    onError: (e) => toast.error(e.message),
  });
  const updateJob = trpc.jobs.update.useMutation({
    onSuccess: () => { toast.success("Job updated!"); utils.jobs.get.invalidate({ id: jobId }); setLocation(`/app/jobs/${jobId}`); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      customerId: form.customerId ? Number(form.customerId) : undefined,
    };
    if (isEdit) {
      updateJob.mutate({ id: jobId, ...data });
    } else {
      createJob.mutate(data);
    }
  };

  const isPending = createJob.isPending || updateJob.isPending;

  return (
    <AppLayout title={isEdit ? "Edit Job" : "New Job"}>
      <div className="flex items-center gap-3 mb-6">
        <Link href={isEdit ? `/app/jobs/${jobId}` : "/app/jobs"}>
          <Button variant="ghost" size="sm" className="gap-1 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Job Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Bathroom renovation" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the work to be done..." rows={4} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="siteAddress">Site Address</Label>
                  <Input id="siteAddress" value={form.siteAddress} onChange={(e) => setForm(f => ({ ...f, siteAddress: e.target.value }))} placeholder="123 Main St, Sydney NSW 2000" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="notes">Customer Notes</Label>
                  <Textarea id="notes" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes visible to customer..." rows={2} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="internalNotes">Internal Notes</Label>
                  <Textarea id="internalNotes" value={form.internalNotes} onChange={(e) => setForm(f => ({ ...f, internalNotes: e.target.value }))} placeholder="Private notes (not visible to customer)..." rows={2} className="mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Trade Type</Label>
                  <Select value={form.tradeType} onValueChange={(v) => setForm(f => ({ ...f, tradeType: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select trade" /></SelectTrigger>
                    <SelectContent>
                      {TRADE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm(f => ({ ...f, priority: v as any }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as any }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="invoiced">Invoiced</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Customer</Label>
                  <Select value={String(form.customerId)} onValueChange={(v) => setForm(f => ({ ...f, customerId: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No customer</SelectItem>
                      {(customers ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input id="estimatedHours" type="number" value={form.estimatedHours} onChange={(e) => setForm(f => ({ ...f, estimatedHours: e.target.value }))} placeholder="e.g. 8" className="mt-1" />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={isPending} className="w-full bg-[#1B2B4B] hover:bg-[#243a63] text-white gap-2">
              <Save className="w-4 h-4" /> {isPending ? "Saving..." : isEdit ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
