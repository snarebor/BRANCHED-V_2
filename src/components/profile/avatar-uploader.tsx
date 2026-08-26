'use client';

import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing-client';
import { initials } from '@/lib/utils';

export function AvatarUploader({
  image,
  name,
  onChange,
}: {
  image: string | null;
  name: string | null;
  onChange: (url: string) => void;
}) {
  const { startUpload, isUploading } = useUploadThing('avatar', {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url;

      if (url) {
        onChange(url);
      }
    },
    onUploadError: (error) => {
      console.error('Avatar upload failed:', error);
    },
  });

  return (
    <label className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-branch-100 text-branch-700">
      {image ? (
        <Image
          src={image}
          alt={name ?? 'Avatar'}
          fill
          className="object-cover"
        />
      ) : (
        <span className="text-2xl font-medium">
          {initials(name)}
        </span>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        ) : (
          <Camera className="h-5 w-5 text-white" />
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            startUpload([file]);
          }

          e.target.value = '';
        }}
      />
    </label>
  );
}