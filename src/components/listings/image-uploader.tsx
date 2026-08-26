'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ImagePlus, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing-client';

const MAX_LISTING_IMAGES = 8;
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export function ImageUploader({
  images,
  onChange,
  maxImages = MAX_LISTING_IMAGES,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}) {
  const [error, setError] = useState<string | null>(null);

  const uploadLimit = Math.min(maxImages, MAX_LISTING_IMAGES);

  const { startUpload, isUploading } = useUploadThing('listingImages', {
    onClientUploadComplete: (res) => {
      const urls = res?.map((file) => file.url).filter(Boolean) ?? [];

      if (urls.length > 0) {
        onChange([...images, ...urls].slice(0, uploadLimit));
      }

      setError(null);
    },

    onUploadError: (err) => {
      setError(err.message || 'Upload failed. Please try again.');
    },
  });

  function handleFiles(fileList: FileList | null) {
    setError(null);

    if (!fileList || fileList.length === 0) {
      return;
    }

    const remainingSlots = uploadLimit - images.length;

    if (remainingSlots <= 0) {
      setError(`You can upload up to ${uploadLimit} images.`);
      return;
    }

    const selectedFiles = Array.from(fileList).slice(0, remainingSlots);

    const invalidFiles = selectedFiles.filter(
      (file) =>
        !file.type.startsWith('image/') ||
        file.size > MAX_FILE_SIZE
    );

    if (invalidFiles.length > 0) {
      setError('Each image must be an image file no larger than 4MB.');
      return;
    }

    startUpload(selectedFiles);
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
    setError(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
          >
            <Image
              src={src}
              alt={`Listing image ${i + 1}`}
              fill
              className="object-cover"
            />

            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Remove image ${i + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {i === 0 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium">
                Cover
              </span>
            )}
          </div>
        ))}

        {images.length < uploadLimit && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-branch-400 hover:text-branch-600">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}

            <span className="text-xs font-medium">
              {isUploading ? 'Uploading...' : 'Add photo'}
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={isUploading}
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Add up to {uploadLimit} photos. Each photo must be 4MB or smaller.
        The first photo is used as the cover image.
      </p>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}