import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import SettingsNav from "@/components/SettingsNav";

export default function SettingsUserProfile() {
  const [, navigate] = useLocation();
  const { user, refresh } = useAuth();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // API calls
  const updateProfileMutation = trpc.auth.updateProfile.useMutation();

  // Load user data when available
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.profilePicture) {
        setProfilePictureUrl(user.profilePicture);
      }
    }
  }, [user]);

  // Profile picture upload handler
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Profile picture must be less than 5MB");
        return;
      }

      setProfilePictureFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePictureUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePictureFile(null);
    setProfilePictureUrl(null);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter your name");
      return;
    }

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload profile picture if changed
      let finalProfilePictureUrl: string | undefined = undefined;
      if (profilePictureFile) {
        setIsUploadingPicture(true);
        try {
          const formData = new FormData();
          formData.append("file", profilePictureFile);

          const response = await fetch("/api/upload/avatar", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Profile picture upload failed");
          }

          const data = await response.json();
          finalProfilePictureUrl = data.url;
        } catch (error) {
          console.error("Profile picture upload error:", error);
          toast.error("Failed to upload profile picture");
          return;
        } finally {
          setIsUploadingPicture(false);
        }
      } else if (profilePictureUrl && !profilePictureUrl.startsWith("data:")) {
        // Keep existing URL if not a data URL
        finalProfilePictureUrl = profilePictureUrl;
      }

      // Update user profile
      const updatedUser = await updateProfileMutation.mutateAsync({
        name,
        email,
        profilePicture: finalProfilePictureUrl,
      });

      // Refresh auth state
      if (updatedUser) {
        await refresh();
      }

      toast.success("Profile updated successfully!");
      setProfilePictureFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <SettingsNav />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsNav />
      <div>
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and profile picture
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture (PNG, JPG, max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                {profilePictureUrl ? (
                  <div className="relative">
                    <img
                      src={profilePictureUrl}
                      alt="Profile picture"
                      className="h-32 w-32 object-cover rounded-full border-4 border-primary"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={removeProfilePicture}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-full border-4 border-dashed border-primary flex items-center justify-center bg-muted/50">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No picture</p>
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
                        Choose Picture
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </label>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: 400x400px or larger, square format
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Full Name *
                </label>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/settings/business")}
              disabled={isSubmitting || isUploadingPicture}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingPicture}
              className="gap-2"
            >
              {(isSubmitting || isUploadingPicture) && (
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
