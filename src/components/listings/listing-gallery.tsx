'use client';

import Image from 'next/image';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

type ListingGalleryProps = {
  images: string[];
  title: string;
};

export function ListingGallery({
  images,
  title,
}: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        No images available
      </div>
    );
  }

  const visibleImages = images.slice(0, 5);

  function previousImage() {
    if (selectedIndex === null) return;

    setSelectedIndex(
      selectedIndex === 0
        ? images.length - 1
        : selectedIndex - 1
    );
  }

  function nextImage() {
    if (selectedIndex === null) return;

    setSelectedIndex(
      selectedIndex === images.length - 1
        ? 0
        : selectedIndex + 1
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        {visibleImages.map((src, index) => (
          <button
            key={src + index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={`relative overflow-hidden bg-muted ${
              index === 0
                ? 'col-span-4 row-span-2 aspect-[16/10] sm:col-span-2 sm:row-span-2'
                : 'col-span-2 aspect-square sm:col-span-1'
            }`}
          >
            <Image
              src={src}
              alt={`${title} photo ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority={index === 0}
            />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              previousImage();
            }}
            className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={images[selectedIndex]}
              alt={`${title} photo ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}