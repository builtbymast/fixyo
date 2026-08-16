import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Briefcase,
  FileText,
  Receipt,
  Loader2,
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

export default function CustomerDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const customerId = params?.id ? parseInt(params.id) : undefined;

  const { data: customer, isLoading: isLoadingCustomer } = trpc.customers.get.useQuery(
    { id: customerId! },
    { enabled: !!customerId }
  );
  const { data: jobs = [] } = trpc.jobs.list.useQuery();
  const { data: quotes = [] } = trpc.quotes.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery();

  const customerJobs = jobs.filter((j) => j.customerId === customerId);
  const customerQuotes = quotes.filter((q) => q.customerId === customerId);
  const customerInvoices = invoices.filter((i) => i.customerId === customerId);

  if (isLoadingCustomer) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Customer Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/app/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">Customer #{customer.id}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setLocation(`/app/customers/${customer.id}/edit`)}
          className="gap-2"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      </div>

      {/* Contact details */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
          {(customer.address || customer.suburb || customer.state || customer.postcode) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                {customer.address && <p>{customer.address}</p>}
                <p className="text-muted-foreground">
                  {[customer.suburb, customer.state, customer.postcode].filter(Boolean).join(" ")}
                </p>
              </div>
            </div>
          )}
          {!customer.email && !customer.phone && !customer.address && (
            <p className="text-sm text-muted-foreground">No contact details on file.</p>
          )}
          {customer.notes && (
            <div className="pt-3 border-t">
              <p className="text-sm font-medium mb-1">Notes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Jobs
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/app/jobs/new")}>
              New Job
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customerJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs yet.</p>
          ) : (
            <div className="space-y-2">
              {customerJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setLocation(`/app/jobs/${job.id}`)}
                >
                  <div>
                    <p className="text-sm font-medium">{job.title}</p>
                    {job.scheduledDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.scheduledDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge className={jobStatusColors[job.status]}>
                    {jobStatusLabels[job.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerQuotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quotes yet.</p>
          ) : (
            <div className="space-y-2">
              {customerQuotes.map((quote) => (
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
                  <Badge className={quoteStatusColors[quote.status]}>
                    {quote.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {customerInvoices.map((invoice) => (
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
                  <Badge className={invoiceStatusColors[invoice.status]}>
                    {invoice.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
