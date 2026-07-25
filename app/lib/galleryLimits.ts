export const MB = 1024 * 1024;

export const MAX_GALLERY_FILES = 10;

// Original image selected by the customer.
// It will be compressed before being uploaded.
export const MAX_SOURCE_IMAGE_BYTES = 10 * MB;

// Videos are not compressed in your current implementation.
export const MAX_VIDEO_BYTES = 6 * MB;

// No file sent to Supabase should exceed this.
export const MAX_STORED_FILE_BYTES = 6 * MB;

export const IMAGE_COMPRESSION_TARGET_MB = 0.8;
export const IMAGE_MAX_DIMENSION = 1600;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
] as const;

export const ALLOWED_GALLERY_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
] as const;

export function isAllowedImageType(type: string) {
  return ALLOWED_IMAGE_TYPES.includes(
    type as (typeof ALLOWED_IMAGE_TYPES)[number]
  );
}

export function isAllowedVideoType(type: string) {
  return ALLOWED_VIDEO_TYPES.includes(
    type as (typeof ALLOWED_VIDEO_TYPES)[number]
  );
}

export function formatFileSize(bytes: number) {
  return `${(bytes / MB).toFixed(1)} MB`;
}

export function normalizeAndValidateGallery(value: unknown): {
  gallery: string[];
  error: string | null;
} {
  if (value === undefined || value === null) {
    return {
      gallery: [],
      error: null,
    };
  }

  if (!Array.isArray(value)) {
    return {
      gallery: [],
      error: "Gallery must be an array.",
    };
  }

  const gallery = value
    .filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0
    )
    .map((item) => item.trim());

  if (gallery.length > MAX_GALLERY_FILES) {
    return {
      gallery,
      error: `A website can have a maximum of ${MAX_GALLERY_FILES} gallery files.`,
    };
  }

  return {
    gallery,
    error: null,
  };
}