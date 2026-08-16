import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Pencil,
  Loader2,
  MapPin,
  Calendar,
  FileText,
  Receipt,
  Image as ImageIcon,
  Mail,
  Phone,
} from "lucide-react";
import { useLocation, useParams } from "wouter";

const jobStatusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const jobStatusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const quoteStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-cyan-100 text-cyan-800",
  signed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-500",
};

const invoiceStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-cyan-100 text-cyan-800",
  partially_paid: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function JobDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const jobId = params?.id ? parseInt(params.id) : undefined;

  const { data: job, isLoading: isLoadingJob } = trpc.jobs.get.useQuery(
    { id: jobId! },
    { enabled: !!jobId }
  );
  const { data: customer } = trpc.customers.get.useQuery(
    { id: job?.customerId! },
    { enabled: !!job?.customerId }
  );
  const { data: quotes = [] } = trpc.quotes.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery();

  const jobQuotes = quotes.filter((q) => q.jobId === jobId);
  const jobInvoices = invoices.filter((i) => i.jobId === jobId);

  if (isLoadingJob) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/jobs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Job Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/jobs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
            <p className="text-muted-foreground mt-1">Job #{job.id}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setLocation(`/app/jobs/${job.id}/edit`)}
          className="gap-2"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={jobStatusColors[job.status]}>{jobStatusLabels[job.status]}</Badge>
            </div>
            {job.scheduledDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}</span>
              </div>
            )}
            {job.completedDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Completed: {new Date(job.completedDate).toLocaleDateString()}</span>
              </div>
            )}
            {job.location && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>{job.location}</span>
              </div>
            )}
            {job.description && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            )}
            {job.notes && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer ? (
              <>
                <p
                  className="text-sm font-medium hover:underline cursor-pointer"
                  onClick={() => setLocation(`/app/customers/${customer.id}`)}
                >
                  {customer.firstName} {customer.lastName}
                </p>
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                      {customer.email}
                    </a>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">
                      {customer.address}
                      {customer.suburb ? `, ${customer.suburb}` : ""}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Loading customer…</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!job.photos || job.photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No photos uploaded for this job yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {job.photos.map((photo) => (
                <div key={photo.id} className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photo.url}
                    alt={photo.caption || "Job photo"}
                    className="w-full h-full object-cover"
                  />
                  {photo.caption && (
                    <Badge
                      className={`absolute top-2 left-2 ${
                        photo.caption === "After" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {photo.caption}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Quotes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/app/quotes/new")}>
                New Quote
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {jobQuotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quotes for this job yet.</p>
            ) : (
              <div className="space-y-2">
                {jobQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setLocation(`/app/quotes/${quote.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">{quote.quoteNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        ${parseFloat(String(quote.totalAmount)).toFixed(2)}
                      </p>
                    </div>
                    <Badge className={quoteStatusColors[quote.status]}>{quote.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Invoices
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/app/invoices/new")}>
                New Invoice
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {jobInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices for this job yet.</p>
            ) : (
              <div className="space-y-2">
                {jobInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setLocation(`/app/invoices/${invoice.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        ${parseFloat(String(invoice.totalAmount)).toFixed(2)}
                      </p>
                    </div>
                    <Badge className={invoiceStatusColors[invoice.status]}>{invoice.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
