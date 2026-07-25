"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";

import { supabaseBrowser } from "@/app/lib/supabase-browser";
import {
  ALLOWED_GALLERY_TYPES,
  IMAGE_COMPRESSION_TARGET_MB,
  IMAGE_MAX_DIMENSION,
  MAX_GALLERY_FILES,
  MAX_SOURCE_IMAGE_BYTES,
  MAX_STORED_FILE_BYTES,
  MAX_VIDEO_BYTES,
  formatFileSize,
  isAllowedImageType,
  isAllowedVideoType,
} from "@/app/lib/galleryLimits";

type GalleryUploaderProps = {
  gallery: string[];
  onChange: (gallery: string[]) => void;
  disabled?: boolean;
};

function getFileExtension(file: File) {
  const extensionByMimeType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };

  return (
    extensionByMimeType[file.type] ||
    file.name.split(".").pop()?.toLowerCase() ||
    "file"
  );
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm)(?:\?.*)?$/i.test(url);
}

/**
 * Converts a Supabase public gallery URL back into its object path.
 *
 * Example:
 * https://abc.supabase.co/storage/v1/object/public/gallery/folder/file.jpg
 *
 * Returns:
 * folder/file.jpg
 */
function getSupabaseGalleryPath(url: string) {
  const marker = "/storage/v1/object/public/gallery/";
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const pathWithQuery = url.slice(markerIndex + marker.length);
  const path = pathWithQuery.split("?")[0];

  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

function validateFile(file: File) {
  const isImage = isAllowedImageType(file.type);
  const isVideo = isAllowedVideoType(file.type);

  if (!isImage && !isVideo) {
    return (
      `"${file.name}" is not supported.\n\n` +
      "Allowed formats: JPEG, PNG, WebP, MP4, and WebM."
    );
  }

  if (isImage && file.size > MAX_SOURCE_IMAGE_BYTES) {
    return (
      `"${file.name}" is ${formatFileSize(file.size)}.\n\n` +
      "Images must be 10 MB or smaller before compression."
    );
  }

  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return (
      `"${file.name}" is ${formatFileSize(file.size)}.\n\n` +
      "Videos must be 6 MB or smaller."
    );
  }

  return null;
}

export default function GalleryUploader({
  gallery,
  onChange,
  disabled = false,
}: GalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(
    null
  );

  const currentCount = gallery.length;
  const remainingSlots = Math.max(
    0,
    MAX_GALLERY_FILES - currentCount
  );

  async function handleFilesSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const input = event.currentTarget;
    const selectedFiles = Array.from(input.files ?? []);

    // Allows selecting the same file again later.
    input.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    if (currentCount >= MAX_GALLERY_FILES) {
      alert(
        `You can upload a maximum of ${MAX_GALLERY_FILES} gallery files.`
      );
      return;
    }

    const filesToProcess = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > remainingSlots) {
      alert(
        `Only ${remainingSlots} more file${
          remainingSlots === 1 ? "" : "s"
        } can be added.`
      );
    }

    const validFiles: File[] = [];

    for (const file of filesToProcess) {
      const validationError = validateFile(file);

      if (validationError) {
        alert(validationError);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    setUploading(true);

    const uploadedUrls: string[] = [];

    try {
      for (const originalFile of validFiles) {
        const isImage = isAllowedImageType(originalFile.type);

        let fileToUpload: File = originalFile;

        if (isImage) {
          fileToUpload = await imageCompression(originalFile, {
            maxSizeMB: IMAGE_COMPRESSION_TARGET_MB,
            maxWidthOrHeight: IMAGE_MAX_DIMENSION,
            useWebWorker: true,
            initialQuality: 0.85,
          });
        }

        if (fileToUpload.size > MAX_STORED_FILE_BYTES) {
          alert(
            `"${originalFile.name}" is still too large after processing. ` +
              "Please choose a smaller file."
          );
          continue;
        }

        const extension = getFileExtension(fileToUpload);
        const fileName = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabaseBrowser.storage
            .from("gallery")
            .upload(fileName, fileToUpload, {
              contentType: fileToUpload.type,
              cacheControl: "31536000",
              upsert: false,
            });

        if (uploadError) {
          console.error(
            "Supabase gallery upload failed:",
            uploadError
          );

          const lowerMessage =
            uploadError.message.toLowerCase();

          if (
            lowerMessage.includes("size") ||
            lowerMessage.includes("maximum") ||
            lowerMessage.includes("too large")
          ) {
            alert(
              `"${originalFile.name}" exceeds the storage file-size limit.`
            );
          } else {
            alert(
              `Upload failed for "${originalFile.name}". Please try again.`
            );
          }

          continue;
        }

        const { data } = supabaseBrowser.storage
          .from("gallery")
          .getPublicUrl(fileName);

        if (!data.publicUrl) {
          console.error(
            "Supabase did not return a public URL:",
            fileName
          );
          continue;
        }

        uploadedUrls.push(data.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        onChange([...gallery, ...uploadedUrls]);
      }
    } catch (error) {
      console.error("Gallery upload error:", error);

      alert(
        "One or more files could not be uploaded. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(url: string, index: number) {
    if (removingIndex !== null) {
      return;
    }

    setRemovingIndex(index);

    try {
      const storagePath = getSupabaseGalleryPath(url);

      // External manually entered URLs do not belong to Supabase.
      if (storagePath) {
        const { error } = await supabaseBrowser.storage
          .from("gallery")
          .remove([storagePath]);

        if (error) {
          console.error(
            "Unable to delete gallery object:",
            error
          );

          alert(
            "The file could not be removed from storage. Please try again."
          );

          return;
        }
      }

      onChange(
        gallery.filter((_, galleryIndex) => galleryIndex !== index)
      );
    } finally {
      setRemovingIndex(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <input
          type="file"
          accept={ALLOWED_GALLERY_TYPES.join(",")}
          multiple
          disabled={
            disabled ||
            uploading ||
            currentCount >= MAX_GALLERY_FILES
          }
          onChange={handleFilesSelected}
          className="
            block w-full text-sm text-gray-600
            disabled:cursor-not-allowed disabled:opacity-50
            file:mr-4 file:rounded-xl file:border-0
            file:bg-indigo-600 file:px-4 file:py-2
            file:font-semibold file:text-white
            hover:file:bg-indigo-700
          "
        />

        <p className="mt-4 text-sm text-gray-600">
          Images: JPEG, PNG, or WebP, up to 10 MB before
          compression.
        </p>

        <p className="mt-1 text-sm text-gray-600">
          Videos: MP4 or WebM, up to 6 MB.
        </p>

        <p className="mt-3 text-xs font-medium text-gray-500">
          {currentCount} of {MAX_GALLERY_FILES} gallery files used
        </p>

        {uploading && (
          <p className="mt-3 text-sm font-semibold text-indigo-600">
            Uploading and processing files...
          </p>
        )}

        {currentCount >= MAX_GALLERY_FILES && (
          <p className="mt-3 text-sm font-semibold text-amber-600">
            You have reached the maximum number of gallery files.
          </p>
        )}
      </div>

      {gallery.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative overflow-hidden rounded-xl border bg-white"
            >
              {isVideoUrl(url) ? (
                <video
                  src={url}
                  controls
                  preload="metadata"
                  className="h-36 w-full bg-black object-cover"
                />
              ) : (
                <img
                  src={url}
                  alt={`Gallery item ${index + 1}`}
                  className="h-36 w-full object-cover"
                />
              )}

              <button
                type="button"
                disabled={removingIndex !== null}
                onClick={() => handleRemove(url, index)}
                className="
                  absolute right-2 top-2 rounded-lg
                  bg-white/95 px-2 py-1 text-xs
                  font-semibold text-red-600 shadow
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                {removingIndex === index
                  ? "Removing..."
                  : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}