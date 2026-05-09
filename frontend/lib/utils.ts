import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformCloudinaryUrl(url: string): string {
  if (!url || typeof url !== "string") return url || "/placeholder.svg";

  if (url.includes("/upload/f_") || url.includes("/upload/q_")) {
    return url;
  }

  if (url.includes(",")) {
    url = url.split(",")[0].trim();
  }

  if (!url.includes("res.cloudinary.com")) {
    return url;
  }

  return url.replace(/\/upload\//, "/upload/f_auto,q_auto/");
}
