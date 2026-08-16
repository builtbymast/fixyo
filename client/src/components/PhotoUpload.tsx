import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface PhotoItem {
  id: string;
  file?: File;
  url?: string;
  type: "before" | "after";
  isUploading?: boolean;
}

interface PhotoUploadProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
  maxFileSize?: number;
}

export default function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 20,
  maxFileSize = 10,
}: PhotoUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload image files only (JPG, PNG, etc.)");
      return false;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      toast.error(`File size must be less than ${maxFileSize}MB`);
      return false;
    }

    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (photos.length >= maxPhotos) {
        toast.error(`Maximum ${maxPhotos} photos allowed`);
        return;
      }

      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(validateFile);

      if (validFiles.length > 0) {
        const newPhotos = validFiles.map((file) => ({
          id: `${Date.now()}-${Math.random()}`,
          file,
          type: "before" as const,
          isUploading: false,
        }));

        onPhotosChange([...photos, ...newPhotos]);
        toast.success(`${validFiles.length} photo(s) added`);
      }
    },
    [photos, maxPhotos, onPhotosChange]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (photos.length >= maxPhotos) {
        toast.error(`Maximum ${maxPhotos} photos allowed`);
        return;
      }

      const files = Array.from(e.target.files || []);
      const validFiles = files.filter(validateFile);

      if (validFiles.length > 0) {
        const newPhotos = validFiles.map((file) => ({
          id: `${Date.now()}-${Math.random()}`,
          file,
          type: "before" as const,
          isUploading: false,
        }));

        onPhotosChange([...photos, ...newPhotos]);
        toast.success(`${validFiles.length} photo(s) added`);
      }
    },
    [photos, maxPhotos, onPhotosChange]
  );

  const removePhoto = (id: string) => {
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  const togglePhotoType = (id: string) => {
    onPhotosChange(
      photos.map((p) =>
        p.id === id ? { ...p, type: p.type === "before" ? "after" : "before" } : p
      )
    );
  };

  const getPreviewUrl = (photo: PhotoItem): string => {
    if (photo.file) {
      return URL.createObjectURL(photo.file);
    }
    return photo.url || "";
  };

  const beforePhotos = photos.filter((p) => p.type === "before");
  const afterPhotos = photos.filter((p) => p.type === "after");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Photos</CardTitle>
          <CardDescription>
            Upload before and after photos to document the work ({photos.length}/{maxPhotos})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragActive
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50"
            )}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={photos.length >= maxPhotos}
            />

            <div className="pointer-events-none space-y-2">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium text-foreground">Drag and drop photos here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse (Max {maxFileSize}MB per file)
                </p>
              </div>
            </div>
          </div>

          {photos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No photos uploaded yet. Add photos to document your work.
            </p>
          )}
        </CardContent>
      </Card>

      {beforePhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">BEFORE</Badge>
              {beforePhotos.length} photo{beforePhotos.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {beforePhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={getPreviewUrl(photo)}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    {photo.isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => togglePhotoType(photo.id)}
                      className="text-xs"
                    >
                      Mark as After
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {afterPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                AFTER
              </Badge>
              {afterPhotos.length} photo{afterPhotos.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {afterPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={getPreviewUrl(photo)}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                    {photo.isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => togglePhotoType(photo.id)}
                      className="text-xs"
                    >
                      Mark as Before
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Photo Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Take clear, well-lit photos from multiple angles</p>
          <p>• Use consistent lighting and positioning for before/after pairs</p>
          <p>• Mark photos as "Before" or "After" to organize them properly</p>
          <p>• Supported formats: JPG, PNG, WebP (Max {maxFileSize}MB per file)</p>
        </CardContent>
      </Card>
    </div>
  );
}
