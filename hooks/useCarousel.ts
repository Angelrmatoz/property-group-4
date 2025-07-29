import { useState, useCallback } from "react";

const images = [
  "/images/Properties/EB-DD5020.webp",
  "/images/Properties/EB-NU4299 (1).webp",
  "/images/Properties/EB-NU4299 (2).webp",
  "/images/Properties/EB-NU4299 (3).webp",
  "/images/Properties/EB-NU4299.webp",
  "/images/Properties/EB-OF2302.webp",
  "/images/Properties/EB-OR1803.webp",
  "/images/Properties/eyJidWNrZXQiOiAiYWx0ZXJlc3RhdGUiLCAia2V5IjogInN0YXRpYy9wcm9wZXJ0aWVzL1JYMzRGTVNUM0gvQlFaRUtZVFRPMS9ZYm5SQnNEM1NnLzIyLTIzLTE5LmpwZyIsICJlZGl0cyI6.jpeg",
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
