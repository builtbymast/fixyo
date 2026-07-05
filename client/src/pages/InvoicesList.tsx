import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function InvoicesList() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { data: invoices, isLoading } = trpc.invoices.list.useQuery();

  const filteredInvoices = invoices?.filter(i =>
    i.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    viewed: "bg-purple-100 text-purple-800",
    partially_paid: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    cancelled: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Track and manage your invoices</p>
        </div>
        <Button onClick={() => setLocation("/app/invoices/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No invoices found. Create your first invoice to get started.</p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setLocation(`/app/invoices/${invoice.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Invoice #{invoice.invoiceNumber}</h3>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                        {invoice.status.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">
                        ${parseFloat(invoice.totalAmount.toString()).toFixed(2)}
                      </span>
                      {invoice.paidAmount && parseFloat(invoice.paidAmount.toString()) > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Paid: ${parseFloat(invoice.paidAmount.toString()).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
