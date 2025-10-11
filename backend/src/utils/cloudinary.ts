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
    console.info(`[cloudinary] configured cloud_name=%s from CLOUDINARY_URL`, cloud_name);
  } else {
    // malformed CLOUDINARY_URL fallback to individual vars
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
      api_key: process.env.CLOUDINARY_API_KEY || "",
      api_secret: process.env.CLOUDINARY_API_SECRET || "",
    });
    console.info("[cloudinary] configured from individual env vars (CLOUDINARY_URL malformed)");
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
  folder = "properties",
) {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
