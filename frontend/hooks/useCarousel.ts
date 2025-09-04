import { useState, useCallback } from "react";

const images = [
  "/images/Properties/luxury-apartment-downtown.webp",
  "/images/Properties/modern-house-interior.webp",
  "/images/Properties/modern-house-kitchen.webp",
  "/images/Properties/modern-house-bedroom.webp",
  "/images/Properties/modern-house-exterior.webp",
  "/images/Properties/office-building-facade.webp",
  "/images/Properties/residential-complex.webp",
  "/images/Properties/commercial-property.jpeg",
];

export const useCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    return images[(currentIndex + 1) % images.length];
  }, [currentIndex]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    return images[(currentIndex - 1 + images.length) % images.length];
  }, [currentIndex]);

  const currentImage = useCallback(() => images[currentIndex], [currentIndex]);

  return { nextImage, prevImage, currentImage, currentIndex };
};
