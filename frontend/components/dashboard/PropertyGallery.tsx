"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

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
          {imgs.map((src, i) => (
            <CarouselItem key={i} className="h-64 md:h-80">
              <img
                src={src}
                alt={`Imagen ${i + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
