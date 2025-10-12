"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { transformCloudinaryUrl } from "@/lib/utils";

type Props = {
  images?: string[];
};

export default function PropertyGallery({ images = [] }: Props) {
  const imgs = images.filter(Boolean);

  if (!imgs.length) {
    return <div className="text-sm text-muted-foreground">Sin imágenes</div>;
  }

  return (
    <div className="relative">
      <Carousel>
        <CarouselContent className="items-stretch">
          {imgs.map((src, i) => {
            // Transform Cloudinary URLs to ensure HEIF/HEIC are served as JPEG
            const transformedSrc = transformCloudinaryUrl(src);

            return (
              <CarouselItem key={i} className="h-64 md:h-80">
                <img
                  src={transformedSrc}
                  alt={`Imagen ${i + 1}`}
                  className="w-full h-full object-contain rounded bg-black/5"
                  onError={(e) => {
                    // Fallback: if the image fails to load, try with explicit jpg format
                    const target = e.target as HTMLImageElement;
                    if (
                      target.src === transformedSrc &&
                      src.includes("res.cloudinary.com")
                    ) {
                      console.warn(
                        `⚠️ Failed to load image ${i + 1}, trying with f_jpg:`,
                        transformedSrc
                      );
                      const fallbackUrl = src.replace(
                        /\/upload\//,
                        "/upload/f_jpg,q_auto/"
                      );
                      target.src = fallbackUrl;
                    }
                  }}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
