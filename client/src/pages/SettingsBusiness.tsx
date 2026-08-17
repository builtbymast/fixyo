import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import SettingsNav from "@/components/SettingsNav";

export default function SettingsBusiness() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    abn: "",
    acn: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    suburb: "",
    state: "",
    postcode: "",
    tradeType: "",
    logo: "",
  });

  // Fetch business data
  const { data: business, isLoading } = trpc.business.get.useQuery();
  const updateBusinessMutation = trpc.business.update.useMutation();

  // Initialize form with business data
  useEffect(() => {
    if (business) {
      setFormData({
        businessName: business.businessName || "",
        abn: business.abn || "",
        acn: business.acn || "",
        phone: business.phone || "",
        email: business.email || "",
        website: business.website || "",
        address: business.address || "",
        suburb: business.suburb || "",
        state: business.state || "",
        postcode: business.postcode || "",
        tradeType: business.tradeType || "",
        logo: business.logo || "",
      });
      if (business.logo) {
        setLogoPreview(business.logo);
      }
    }
  }, [business]);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await response.json();
      setLogoPreview(url);
      setFormData((prev) => ({ ...prev, logo: url }));
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.businessName.trim()) {
      toast.error("Business name is required");
      return;
    }

    setSaving(true);
    try {
      await updateBusinessMutation.mutateAsync(formData);
      toast.success("Business profile updated successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save business profile");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SettingsNav />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="space-y-6">
        <SettingsNav />
        <div>
          <h1 className="text-3xl font-bold">Business Settings</h1>
          <p className="text-muted-foreground mt-1">No business profile found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsNav />
      <div>
        <h1 className="text-3xl font-bold">Business Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your business profile and company information
        </p>
      </div>

      {/* Logo Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              {logoPreview ? (
                <div className="w-32 h-32 rounded-lg border border-border overflow-hidden bg-accent/5 flex items-center justify-center">
                  <img
                    src={logoPreview}
                    alt="Company logo"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border bg-accent/5 flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No logo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex-1 space-y-2">
              <Button
                onClick={handleLogoClick}
                disabled={uploading}
                variant="outline"
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, or GIF (max 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              placeholder="Your business name"
            />
          </div>

          {/* ABN and ACN */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="abn">ABN</Label>
              <Input
                id="abn"
                name="abn"
                value={formData.abn}
                onChange={handleInputChange}
                placeholder="11 digits"
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acn">ACN</Label>
              <Input
                id="acn"
                name="acn"
                value={formData.acn}
                onChange={handleInputChange}
                placeholder="9 digits"
                maxLength={9}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(02) 1234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@business.com"
              />
            </div>
          </div>

          {/* Website and Trade Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeType">Trade Type</Label>
              <Input
                id="tradeType"
                name="tradeType"
                value={formData.tradeType}
                onChange={handleInputChange}
                placeholder="e.g., Plumbing, Electrical"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street address"
              rows={3}
            />
          </div>

          {/* Suburb, State, Postcode */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="suburb">Suburb</Label>
              <Input
                id="suburb"
                name="suburb"
                value={formData.suburb}
                onChange={handleInputChange}
                placeholder="Suburb"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="NSW"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                name="postcode"
                value={formData.postcode}
                onChange={handleInputChange}
                placeholder="2000"
                maxLength={4}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={saving || !formData.businessName.trim()}
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
