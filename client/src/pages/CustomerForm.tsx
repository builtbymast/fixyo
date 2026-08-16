import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

export default function CustomerForm() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isEdit = !!params?.id;
  const customerId = params?.id ? parseInt(params.id) : undefined;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: existing, isLoading: isLoadingCustomer } = trpc.customers.get.useQuery(
    { id: customerId! },
    { enabled: isEdit && !!customerId }
  );

  useEffect(() => {
    if (existing) {
      setFirstName(existing.firstName ?? "");
      setLastName(existing.lastName ?? "");
      setEmail(existing.email ?? "");
      setPhone(existing.phone ?? "");
      setAddress(existing.address ?? "");
      setSuburb(existing.suburb ?? "");
      setState(existing.state ?? "");
      setPostcode(existing.postcode ?? "");
      setNotes(existing.notes ?? "");
    }
  }, [existing]);

  const createMutation = trpc.customers.create.useMutation();
  const updateMutation = trpc.customers.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (postcode && !/^\d{4}$/.test(postcode)) {
      toast.error("Postcode must be 4 digits");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        suburb: suburb.trim() || undefined,
        state: state || undefined,
        postcode: postcode.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (isEdit && customerId) {
        await updateMutation.mutateAsync({ id: customerId, ...data });
        toast.success("Customer updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Customer added successfully");
      }

      navigate("/app/customers");
    } catch (error) {
      console.error("Customer form error:", error);
      toast.error(isEdit ? "Failed to update customer" : "Failed to add customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoadingCustomer) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/app/customers")} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? "Edit Customer" : "Add Customer"}</h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update customer details" : "Add a new customer to your database"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">First Name *</label>
                <Input
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Last Name *</label>
                <Input
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone</label>
                <Input
                  placeholder="0400 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Street Address</label>
              <Input
                placeholder="123 Main Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-sm font-medium mb-2 block">Suburb</label>
                <Input
                  placeholder="Sydney"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Select value={state} onValueChange={setState} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {AU_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Postcode</label>
                <Input
                  placeholder="2000"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  disabled={isSubmitting}
                  maxLength={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any notes about this customer (preferred contact times, parking, access instructions, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/app/customers")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Add Customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
