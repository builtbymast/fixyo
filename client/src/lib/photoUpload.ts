/**
 * Upload a photo file to S3 via the backend
 * Returns the URL of the uploaded photo
 */
export async function uploadPhotoToS3(
  file: File,
  jobId: number
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("jobId", jobId.toString());

  try {
    const response = await fetch("/api/upload/photo", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Photo upload error:", error);
    throw error;
  }
}

/**
 * Upload multiple photos for a job
 * Returns array of uploaded photo URLs
 */
export async function uploadJobPhotos(
  files: File[],
  jobId: number
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadPhotoToS3(file, jobId).catch((error) => {
      console.error(`Failed to upload ${file.name}:`, error);
      return null;
    })
  );

  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
}

/**
 * Get photo metadata input for database save
 */
export function getPhotoMetadataInput(
  jobId: number,
  type: "before" | "after"
) {
  return {
    jobId,
    url: "",
    caption: type === "before" ? "Before" : "After",
  };
}
