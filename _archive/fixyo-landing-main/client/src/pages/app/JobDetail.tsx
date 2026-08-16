import AppLayout from "@/components/app/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Edit, FileText, MapPin, Receipt, Trash2 } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  invoiced: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const jobId = parseInt(id ?? "0");
  const utils = trpc.useUtils();

  const { data: job, isLoading } = trpc.jobs.get.useQuery({ id: jobId }, { enabled: !!jobId });
  const updateStatus = trpc.jobs.updateStatus.useMutation({
    onSuccess: () => { utils.jobs.get.invalidate({ id: jobId }); toast.success("Status updated"); },
  });
  const deleteJob = trpc.jobs.delete.useMutation({
    onSuccess: () => { toast.success("Job deleted"); setLocation("/app/jobs"); },
  });

  if (isLoading) {
    return (
      <AppLayout title="Job">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-40 bg-gray-200 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout title="Job Not Found">
        <p className="text-gray-500">This job could not be found.</p>
        <Link href="/app/jobs"><Button className="mt-4">Back to Jobs</Button></Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={job.title}>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/jobs">
          <Button variant="ghost" size="sm" className="gap-1 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> Jobs
          </Button>
        </Link>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-600"}`}>
          {job.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base text-[#1B2B4B]">Job Details</CardTitle>
              <div className="flex gap-2">
                <Link href={`/app/jobs/${job.id}/edit`}>
                  <Button size="sm" variant="outline" className="gap-1"><Edit className="w-3 h-3" /> Edit</Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => { if (confirm("Delete this job?")) deleteJob.mutate({ id: job.id }); }}
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Job Number</span><p className="font-medium text-[#1B2B4B]">{job.jobNumber}</p></div>
                <div><span className="text-gray-400">Trade Type</span><p className="font-medium text-[#1B2B4B]">{job.tradeType ?? "—"}</p></div>
                <div><span className="text-gray-400">Priority</span><p className="font-medium text-[#1B2B4B] capitalize">{job.priority ?? "medium"}</p></div>
                <div><span className="text-gray-400">Created</span><p className="font-medium text-[#1B2B4B]">{format(new Date(job.createdAt), "dd MMM yyyy")}</p></div>
                {job.scheduledDate && (
                  <div><span className="text-gray-400">Scheduled</span><p className="font-medium text-[#1B2B4B]">{format(new Date(job.scheduledDate), "dd MMM yyyy")}</p></div>
                )}
                {job.completedDate && (
                  <div><span className="text-gray-400">Completed</span><p className="font-medium text-[#1B2B4B]">{format(new Date(job.completedDate), "dd MMM yyyy")}</p></div>
                )}
              </div>
              {job.siteAddress && (
                <div className="flex items-start gap-2 text-sm pt-2 border-t border-gray-100">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[#1B2B4B]">{job.siteAddress}</span>
                </div>
              )}
              {job.description && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              )}
              {job.notes && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          {job.photos && job.photos.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Photos ({job.photos.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {job.photos.map((photo) => (
                    <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
                      <img src={photo.url} alt={photo.caption ?? "Job photo"} className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition-opacity" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Update Status</CardTitle></CardHeader>
            <CardContent>
              <Select
                value={job.status}
                onValueChange={(val) => updateStatus.mutate({ id: job.id, status: val as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="invoiced">Invoiced</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base text-[#1B2B4B]">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/app/quotes/new?jobId=${job.id}`}>
                <Button variant="outline" className="w-full gap-2 text-sm justify-start">
                  <FileText className="w-4 h-4" /> Create Quote
                </Button>
              </Link>
              <Link href={`/app/invoices/new?jobId=${job.id}`}>
                <Button variant="outline" className="w-full gap-2 text-sm justify-start">
                  <Receipt className="w-4 h-4" /> Create Invoice
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
