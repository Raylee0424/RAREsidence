import { toast } from "sonner";

// Keep in sync with backend/src/units/photo-upload.ts.
export const ACCEPTED_PHOTO_TYPES = "image/jpeg,image/png,image/webp";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Drops files the API would reject and tells the user why. */
export function filterValidPhotos(files: File[]): File[] {
  const accepted = ACCEPTED_PHOTO_TYPES.split(",");
  return files.filter((file) => {
    if (!accepted.includes(file.type)) {
      toast.error(`${file.name} is not a JPEG, PNG or WebP image`);
      return false;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error(`${file.name} is larger than 5 MB`);
      return false;
    }
    return true;
  });
}
