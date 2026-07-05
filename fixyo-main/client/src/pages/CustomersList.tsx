import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function CustomersList() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = trpc.customers.list.useQuery();

  const filteredCustomers = customers?.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your client database</p>
        </div>
        <Button onClick={() => setLocation("/app/customers/new")} className="gap-2">
          <Plus className="w-4 h-4" />
          New Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No customers found. Add your first customer to get started.</p>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setLocation(`/app/customers/${customer.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{customer.firstName} {customer.lastName}</h3>
                    {customer.email && <p className="text-sm text-muted-foreground">{customer.email}</p>}
                    {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
                    {customer.address && <p className="text-xs text-muted-foreground mt-2">{customer.address}</p>}
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
