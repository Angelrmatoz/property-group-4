import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Transform Cloudinary URLs to ensure HEIF/HEIC images are automatically converted
 * to a browser-compatible format (JPEG). This uses Cloudinary's automatic format
 * conversion feature by injecting 'f_auto,q_auto' into the URL.
 *
 * For URLs like: https://res.cloudinary.com/.../upload/v123/folder/image.heic
 * Transforms to: https://res.cloudinary.com/.../upload/f_auto,q_auto/v123/folder/image.heic
 *
 * Cloudinary will then serve it as JPEG even though the original is HEIC.
 *
 * @param url - The original Cloudinary URL or any image URL
 * @returns The transformed URL with format conversion applied (if applicable)
 */
export function transformCloudinaryUrl(url: string): string {
  if (!url || typeof url !== "string") return url || "/placeholder.svg";

  // Safety check: if URL contains commas, take only the first part
  if (url.includes(",")) {
    url = url.split(",")[0].trim();
  }

  // Check if it's a Cloudinary URL
  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  // Check if transformations are already present (avoid double-transformation)
  if (url.includes("/upload/f_") || url.includes("/upload/q_")) {
    return url;
  }

  // Insert f_auto (automatic format) and q_auto (automatic quality) after /upload/
  // This tells Cloudinary to serve the best format for the browser (JPEG for HEIF)
  const transformed = url.replace(/\/upload\//, "/upload/f_auto,q_auto/");

  return transformed;
}
