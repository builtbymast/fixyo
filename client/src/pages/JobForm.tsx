import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import PhotoUpload, { PhotoItem } from "@/components/PhotoUpload";
import { uploadPhotoToS3 } from "@/lib/photoUpload";

const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  customerId: z.number().min(1, "Please select a customer"),
  description: z.string().optional(),
  location: z.string().optional(),
  scheduledDate: z.date().optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

export default function JobForm() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [originalPhotoCaptions, setOriginalPhotoCaptions] = useState<Record<string, string>>({});

  const isEditMode = !!params?.id;
  const jobId = params?.id ? parseInt(params.id) : undefined;

  const { data: customers = [] } = trpc.customers.list.useQuery();
  const { data: existingJob } = trpc.jobs.get.useQuery(
    { id: jobId || 0 },
    { enabled: isEditMode && !!jobId }
  );

  const createMutation = trpc.jobs.create.useMutation();
  const updateMutation = trpc.jobs.update.useMutation();
  const addPhotoMutation = trpc.jobs.addPhoto.useMutation();
  const deletePhotoMutation = trpc.jobs.deletePhoto.useMutation();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      customerId: 0,
      description: "",
      location: "",
      scheduledDate: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    if (isEditMode && existingJob) {
      form.reset({
        title: existingJob.title,
        customerId: existingJob.customerId,
        description: existingJob.description || "",
        location: existingJob.location || "",
        scheduledDate: existingJob.scheduledDate ? new Date(existingJob.scheduledDate) : undefined,
        notes: existingJob.notes || "",
        status: existingJob.status as any,
      });

      if (existingJob.photos && existingJob.photos.length > 0) {
        setPhotos(
          existingJob.photos.map((photo) => ({
            id: `db-${photo.id}`,
            url: photo.url,
            type: photo.caption === "After" ? "after" : "before",
          }))
        );
        setOriginalPhotoCaptions(
          Object.fromEntries(existingJob.photos.map((photo) => [`db-${photo.id}`, photo.caption ?? ""]))
        );
      }
    }
  }, [existingJob, isEditMode, form]);

  const syncPhotos = async (resolvedJobId: number) => {
    // Photos removed from the original set
    const currentIds = new Set(photos.map((p) => p.id));
    const deletedIds = Object.keys(originalPhotoCaptions).filter((id) => !currentIds.has(id));
    for (const id of deletedIds) {
      await deletePhotoMutation.mutateAsync({ id: parseInt(id.replace("db-", "")) });
    }

    // Already-saved photos whose before/after type was toggled: re-save with new caption
    for (const photo of photos) {
      if (!photo.file && photo.id.startsWith("db-")) {
        const newCaption = photo.type === "after" ? "After" : "Before";
        if (originalPhotoCaptions[photo.id] !== newCaption) {
          await deletePhotoMutation.mutateAsync({ id: parseInt(photo.id.replace("db-", "")) });
          await addPhotoMutation.mutateAsync({ jobId: resolvedJobId, url: photo.url!, caption: newCaption });
        }
      }
    }

    // Newly added photos: upload to storage, then save metadata
    const newPhotos = photos.filter((p) => p.file);
    for (const photo of newPhotos) {
      const url = await uploadPhotoToS3(photo.file!, resolvedJobId);
      await addPhotoMutation.mutateAsync({
        jobId: resolvedJobId,
        url,
        caption: photo.type === "after" ? "After" : "Before",
      });
    }
  };

  const onSubmit = async (data: JobFormData) => {
    try {
      setIsLoading(true);
      let resolvedJobId = jobId;

      if (isEditMode && jobId) {
        await updateMutation.mutateAsync({
          id: jobId,
          title: data.title,
          description: data.description,
          location: data.location,
          scheduledDate: data.scheduledDate,
          notes: data.notes,
          status: data.status,
        });
      } else {
        const result = await createMutation.mutateAsync({
          customerId: data.customerId,
          title: data.title,
          description: data.description,
          location: data.location,
          scheduledDate: data.scheduledDate,
          notes: data.notes,
        });
        resolvedJobId = result.id;
      }

      try {
        if (resolvedJobId) await syncPhotos(resolvedJobId);
        toast.success(isEditMode ? "Job updated successfully" : "Job created successfully");
      } catch (photoError) {
        console.error("Photo sync error:", photoError);
        toast.error("Job saved, but some photos failed to upload");
      }

      setLocation("/app/jobs");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save job");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setLocation("/app/jobs");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Edit Job" : "Create New Job"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update job details and information" : "Add a new job to your business"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.firstName} {customer.lastName} ({customer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Kitchen Renovation, Plumbing Repair"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>A clear title for the job</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the job details, scope of work, and any special requirements"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Provide details about the work to be done</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 123 Main St, Sydney NSW 2000"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The address where the job will be performed</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Scheduled Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>When should this job be scheduled?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Current status of the job</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes, special instructions, or important information about this job"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Internal notes for your team</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? "Update Job" : "Create Job"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <PhotoUpload photos={photos} onPhotosChange={setPhotos} />

      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Use clear, descriptive job titles so customers understand the work</p>
          <p>• Add detailed descriptions to avoid misunderstandings</p>
          <p>• Set accurate scheduled dates to keep your calendar organized</p>
          <p>• Use notes for internal team communication and special instructions</p>
        </CardContent>
      </Card>
    </div>
  );
}
