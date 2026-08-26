'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ImageUploader } from '@/components/listings/image-uploader';
import type { CategoryData } from '@/types';

export type ListingFormValues = {
  title: string;
  description: string;
  price: string;
  currency: string;
  location: string;
  images: string[];
  categorySlug: string;
};

export function ListingForm({
  categories,
  initialValues,
  listingId,
}: {
  categories: CategoryData[];
  initialValues?: Partial<ListingFormValues>;
  listingId?: string;
}) {
  const router = useRouter();
  const isEditing = !!listingId;

  const [values, setValues] = useState<ListingFormValues>({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    price: initialValues?.price ?? '',
    currency: 'RUB',
    location: initialValues?.location ?? '',
    images: initialValues?.images ?? [],
    categorySlug: initialValues?.categorySlug ?? categories[0]?.slug ?? '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ListingFormValues>(
    key: K,
    value: ListingFormValues[K],
  ) {
    setValues((v) => ({
      ...v,
      [key]: value,
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    const payload = {
  title: values.title,
  description: values.description,
  price: values.price ? Number(values.price) : null,
  location: values.location,
  images: values.images,
  categorySlug: values.categorySlug,
};

    try {
      const res = await fetch(
        isEditing ? `/api/listings/${listingId}` : '/api/listings',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong.');
      }

      router.push(`/listings/${data.listing.id}`);
      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.',
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">
          Title
        </Label>

        <Input
          id="title"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="e.g. Apartment near Moscow State University"
          required
          minLength={5}
          maxLength={120}
        />
      </div>


      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="flex flex-col gap-2">
          <Label htmlFor="category">
            Category
          </Label>

          <Select
            value={values.categorySlug}
            onValueChange={(v) => update('categorySlug', v)}
          >

            <SelectTrigger id="category">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.nameRu}
                </SelectItem>
              ))}
            </SelectContent>

          </Select>
        </div>


        <div className="flex flex-col gap-2">

          <Label htmlFor="location">
            Location
          </Label>

          <Input
            id="location"
            value={values.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="e.g. Moscow, Russia"
            required
          />

        </div>

      </div>


      <div className="flex flex-col gap-2">

        <Label htmlFor="price">
          Price (₽) optional
        </Label>

        <Input
          id="price"
          type="number"
          min={0}
          step="1"
          value={values.price}
          onChange={(e) => update('price', e.target.value)}
          placeholder="Leave blank for 'Price on request'"
        />

      </div>


      <div className="flex flex-col gap-2">

        <Label htmlFor="description">
          Description
        </Label>

        <Textarea
          id="description"
          value={values.description}
          onChange={(e) =>
            update('description', e.target.value)
          }
          placeholder="Describe your item, service, apartment, or offer."
          rows={6}
          required
          minLength={20}
          maxLength={5000}
        />

      </div>


      <div className="flex flex-col gap-2">

        <Label>
          Photos
        </Label>

        <ImageUploader
          images={values.images}
          onChange={(imgs) =>
            update('images', imgs)
          }
        />

      </div>


      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}


      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="self-start"
      >
        {submitting
          ? 'Saving...'
          : isEditing
            ? 'Save changes'
            : 'Publish listing'}
      </Button>

    </form>
  );
}