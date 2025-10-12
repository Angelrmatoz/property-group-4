// ...existing code...
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Configuración de Cloudinary: preferir CLOUDINARY_URL si está definido
// CLOUDINARY_URL tiene el formato: cloudinary://<api_key>:<api_secret>@<cloud_name>
const CLOUDINARY_URL = process.env.CLOUDINARY_URL || "";
if (CLOUDINARY_URL) {
  const m = CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (m) {
    const [, api_key, api_secret, cloud_name] = m;
    cloudinary.config({ cloud_name, api_key, api_secret });
    // sólo logueamos el cloud_name para depuración (no exponer claves)
    console.info(
      `[cloudinary] configured cloud_name=%s from CLOUDINARY_URL`,
      cloud_name
    );
  } else {
    // malformed CLOUDINARY_URL fallback to individual vars
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
      api_key: process.env.CLOUDINARY_API_KEY || "",
      api_secret: process.env.CLOUDINARY_API_SECRET || "",
    });
    console.info(
      "[cloudinary] configured from individual env vars (CLOUDINARY_URL malformed)"
    );
  }
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: process.env.CLOUDINARY_API_KEY || "",
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
  });
  console.info("[cloudinary] configured from individual env vars");
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = "properties"
) {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Extracts the public_id from a Cloudinary URL.
 * Example URL: https://res.cloudinary.com/demo/image/upload/v1234/properties/abc123.jpg
 * Example with transformations: https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1234/properties/abc123.jpg
 * Returns: properties/abc123
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    if (!cloudinaryUrl || typeof cloudinaryUrl !== "string") return null;

    // Match pattern: /upload/[transformations]/v{version}/{folder}/{filename}.{ext}
    // or /upload/[transformations]/{folder}/{filename}.{ext}
    // Transformations are optional and can include things like f_auto,q_auto,w_500,h_300

    // First, find the /upload/ part
    const uploadIndex = cloudinaryUrl.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    // Get everything after /upload/
    const afterUpload = cloudinaryUrl.substring(uploadIndex + 8); // 8 = length of '/upload/'

    // Remove any transformation parameters (anything before the version or folder path)
    // Transformations typically contain commas and underscores like f_auto,q_auto
    // The actual path starts with either v{digits}/ or directly with the folder name

    // Split by / to get parts
    const parts = afterUpload.split("/");

    // Find where the actual path starts (skip transformation parameters)
    let pathStartIndex = 0;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      // If part starts with v followed by digits, or doesn't contain commas/transformation syntax
      if (/^v\d+$/.test(part)) {
        // This is a version, next part is the actual path
        pathStartIndex = i + 1;
        break;
      } else if (part && !part.includes(",") && !part.includes("_")) {
        // This looks like a folder name (no transformation syntax)
        pathStartIndex = i;
        break;
      }
    }

    // Get the path parts (folder/filename)
    const pathParts = parts.slice(pathStartIndex);
    if (pathParts.length === 0) return null;

    // Join back and remove extension
    const fullPath = pathParts.join("/");
    const match = fullPath.match(/^(.+)\.\w+$/);
    if (match && match[1]) {
      return match[1];
    }

    return null;
  } catch (error) {
    console.error("[cloudinary] Error extracting public_id:", error);
    return null;
  }
}

/**
 * Deletes an image from Cloudinary using its public_id.
 * Can accept either a full URL or a public_id directly.
 */
export async function deleteFromCloudinary(
  publicIdOrUrl: string
): Promise<void> {
  try {
    let publicId = publicIdOrUrl;

    // If it looks like a URL, extract the public_id
    if (publicIdOrUrl.includes("cloudinary.com")) {
      const extracted = extractPublicId(publicIdOrUrl);
      if (!extracted) {
        console.warn(
          `[cloudinary] Could not extract public_id from URL: ${publicIdOrUrl}`
        );
        return;
      }
      publicId = extracted;
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "not found") {
      console.warn(`[cloudinary] Image not found in Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error(`[cloudinary] Error deleting image ${publicIdOrUrl}:`, error);
    // Don't throw - we don't want to block property deletion if Cloudinary fails
  }
}

/**
 * Deletes multiple images from Cloudinary.
 * Useful when deleting a property with multiple images.
 */
export async function deleteMultipleFromCloudinary(
  publicIdsOrUrls: string[]
): Promise<void> {
  if (!Array.isArray(publicIdsOrUrls) || publicIdsOrUrls.length === 0) {
    return;
  }

  // Delete in parallel for better performance
  await Promise.all(
    publicIdsOrUrls.map((idOrUrl) => deleteFromCloudinary(idOrUrl))
  );
}
