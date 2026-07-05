import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function SettingsBusinessProfile() {
  const [, navigate] = useLocation();

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [abn, setAbn] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("NSW");
  const [postcode, setPostcode] = useState("");
  const [website, setWebsite] = useState("");
  const [tradeType, setTradeType] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // API calls
  const { data: business } = trpc.business.get.useQuery();
  const updateBusinessMutation = trpc.business.update.useMutation();

  // Load business data when available
  React.useEffect(() => {
    if (business) {
      setCompanyName(business.businessName || "");
      setAbn(business.abn || "");
      setEmail(business.email || "");
      setPhone(business.phone || "");
      setAddress(business.address || "");
      setSuburb(business.suburb || "");
      setState(business.state || "NSW");
      setPostcode(business.postcode || "");
      setWebsite(business.website || "");
      setTradeType(business.tradeType || "");
    }
  }, [business]);

  // Logo upload handler
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo must be less than 5MB");
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoUrl(null);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName) {
      toast.error("Please enter company name");
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload logo if changed
      let finalLogoUrl = logoUrl;
      if (logoFile) {
        setIsUploadingLogo(true);
        try {
          const formData = new FormData();
          formData.append("file", logoFile);

          const response = await fetch("/api/upload/logo", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Logo upload failed");
          }

          const data = await response.json();
          finalLogoUrl = data.url;
        } catch (error) {
          console.error("Logo upload error:", error);
          toast.error("Failed to upload logo");
          return;
        } finally {
          setIsUploadingLogo(false);
        }
      }

      // Update business profile
      await updateBusinessMutation.mutateAsync({
        businessName: companyName,
        abn: abn || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        suburb: suburb || undefined,
        state: state || undefined,
        postcode: postcode || undefined,
        website: website || undefined,
        tradeType: tradeType || undefined,
        logo: finalLogoUrl || undefined,
      });

      toast.success("Business profile updated successfully!");
      setLogoFile(null);
    } catch (error) {
      console.error("Error updating business profile:", error);
      toast.error("Failed to update business profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/settings")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Business Profile</h1>
            <p className="text-muted-foreground">
              Manage your company information and branding
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Section */}
          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
              <CardDescription>
                Upload your company logo for invoices and quotes (PNG, JPG, max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                {logoUrl ? (
                  <div className="relative">
                    <img
                      src={logoUrl}
                      alt="Company logo"
                      className="h-32 w-32 object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={removeLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No logo</p>
                    </div>
                  </div>
                )}

                <div className="flex-1">
                  <label className="block">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: 200x200px or larger, square format
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Business Name *
                  </label>
                  <Input
                    placeholder="ABC Plumbing Services"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">ABN</label>
                  <Input
                    placeholder="12 345 678 901"
                    value={abn}
                    onChange={(e) => setAbn(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="info@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    placeholder="(02) 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Website</label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Trade Type</label>
                <Input
                  placeholder="e.g. Plumbing, Electrical, Carpentry"
                  value={tradeType}
                  onChange={(e) => setTradeType(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Street Address</label>
                <Input
                  placeholder="123 Main Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Suburb/City</label>
                  <Input
                    placeholder="Sydney"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="QLD">QLD</option>
                    <option value="WA">WA</option>
                    <option value="SA">SA</option>
                    <option value="TAS">TAS</option>
                    <option value="ACT">ACT</option>
                    <option value="NT">NT</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Postcode</label>
                  <Input
                    placeholder="2000"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/settings")}
              disabled={isSubmitting || isUploadingLogo}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingLogo}
              className="gap-2"
            >
              {(isSubmitting || isUploadingLogo) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
