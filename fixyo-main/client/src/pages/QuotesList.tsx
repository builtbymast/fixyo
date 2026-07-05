import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function QuotesList() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { data: quotes, isLoading } = trpc.quotes.list.useQuery();

  const filteredQuotes = quotes?.filter(q =>
    q.quoteNumber.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    sent: "bg-blue-100 text-blue-800",
    viewed: "bg-purple-100 text-purple-800",
    signed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    expired: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotes</h1>
          <p className="text-muted-foreground mt-1">Create and manage quotes for your customers</p>
        </div>
        <Button onClick={() => setLocation("/app/quotes/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Quote
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search quotes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading quotes...</div>
        ) : filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No quotes found. Create your first quote to get started.</p>
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => (
            <Card
              key={quote.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setLocation(`/app/quotes/${quote.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Quote #{quote.quoteNumber}</h3>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge className={statusColors[quote.status as keyof typeof statusColors]}>
                        {quote.status}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">
                        ${parseFloat(quote.totalAmount.toString()).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(quote.createdAt).toLocaleDateString()}
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
