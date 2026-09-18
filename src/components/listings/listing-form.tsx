'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { ImageUploader } from '@/components/listings/image-uploader';
import type { CategoryData } from '@/types';

type CharacteristicField = {
  key: string;
  label: string;
  placeholder?: string;
  options?: string[];
};

export type ListingCharacteristics = Record<string, string>;

export type ListingFormValues = {
  title: string;
  description: string;
  price: string;
  currency: string;
  location: string;
  images: string[];
  categorySlug: string;
  characteristics: Record<string, string>;
};

const CHARACTERISTIC_FIELDS: Record<string, CharacteristicField[]> = {
  electronics: [
    {
      key: 'condition',
      label: 'Condition',
      options: ['New', 'Like new', 'Used', 'For parts'],
    },
    {
      key: 'brand',
      label: 'Brand',
      placeholder: 'e.g. Apple, Samsung, Sony',
    },
    {
      key: 'model',
      label: 'Model',
      placeholder: 'e.g. iPhone 15 Pro',
    },
    {
      key: 'specifications',
      label: 'Specifications',
      placeholder: 'e.g. 256GB, 8GB RAM, black',
    },
  ],

  vehicles: [
    {
      key: 'condition',
      label: 'Condition',
      options: ['New', 'Used'],
    },
    {
      key: 'make',
      label: 'Make',
      placeholder: 'e.g. Toyota',
    },
    {
      key: 'model',
      label: 'Model',
      placeholder: 'e.g. Camry',
    },
    {
      key: 'year',
      label: 'Year',
      placeholder: 'e.g. 2021',
    },
    {
      key: 'mileage',
      label: 'Mileage',
      placeholder: 'e.g. 85,000 km',
    },
    {
      key: 'transmission',
      label: 'Transmission',
      options: ['Manual', 'Automatic', 'CVT', 'Other'],
    },
    {
      key: 'fuel',
      label: 'Fuel type',
      options: ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Other'],
    },
  ],

  housing: [
    {
      key: 'propertyType',
      label: 'Property type',
      options: [
        'Apartment',
        'Room',
        'House',
        'Studio',
        'Office',
        'Other',
      ],
    },
    {
      key: 'rooms',
      label: 'Rooms',
      placeholder: 'e.g. 1',
    },
    {
      key: 'area',
      label: 'Area',
      placeholder: 'e.g. 42 m²',
    },
    {
      key: 'floor',
      label: 'Floor',
      placeholder: 'e.g. 5',
    },
    {
      key: 'totalFloors',
      label: 'Total floors',
      placeholder: 'e.g. 12',
    },
    {
      key: 'furnished',
      label: 'Furnished',
      options: ['Fully furnished', 'Partly furnished', 'Unfurnished'],
    },
    {
      key: 'rentalType',
      label: 'Listing type',
      options: ['For rent', 'For sale', 'Roommate wanted'],
    },
  ],

  jobs: [
    {
      key: 'employmentType',
      label: 'Employment type',
      options: [
        'Full-time',
        'Part-time',
        'Contract',
        'Temporary',
        'Internship',
      ],
    },
    {
      key: 'schedule',
      label: 'Schedule',
      options: [
        'On-site',
        'Remote',
        'Hybrid',
        'Flexible',
      ],
    },
    {
      key: 'experience',
      label: 'Experience',
      options: [
        'No experience',
        'Entry level',
        '1–3 years',
        '3–5 years',
        '5+ years',
      ],
    },
    {
      key: 'salary',
      label: 'Salary',
      placeholder: 'e.g. 80,000 RUB/month',
    },
  ],

  services: [
    {
      key: 'serviceType',
      label: 'Service type',
      placeholder: 'e.g. Translation, tutoring, photography',
    },
    {
      key: 'experience',
      label: 'Experience',
      placeholder: 'e.g. 3 years',
    },
    {
      key: 'availability',
      label: 'Availability',
      options: [
        'Weekdays',
        'Weekends',
        'Evenings',
        'Flexible',
      ],
    },
    {
      key: 'format',
      label: 'Format',
      options: [
        'In person',
        'Online',
        'Both',
      ],
    },
  ],

  marketplace: [
    {
      key: 'condition',
      label: 'Condition',
      options: ['New', 'Like new', 'Used', 'For parts'],
    },
    {
      key: 'brand',
      label: 'Brand',
      placeholder: 'e.g. Nike, IKEA, Apple',
    },
    {
      key: 'model',
      label: 'Model',
      placeholder: 'Optional model',
    },
    {
      key: 'details',
      label: 'Details',
      placeholder: 'Size, colour, material, specifications, etc.',
    },
  ],

  education: [
    {
      key: 'type',
      label: 'Type',
      options: [
        'Tutoring',
        'Course',
        'Language learning',
        'Study group',
        'Educational material',
        'Other',
      ],
    },
    {
      key: 'subject',
      label: 'Subject',
      placeholder: 'e.g. Mathematics, Russian, Biology',
    },
    {
      key: 'level',
      label: 'Level',
      options: [
        'Beginner',
        'Intermediate',
        'Advanced',
        'School',
        'University',
        'Professional',
      ],
    },
    {
      key: 'format',
      label: 'Format',
      options: [
        'Online',
        'In person',
        'Both',
      ],
    },
  ],

  community: [
    {
      key: 'eventType',
      label: 'Type',
      options: [
        'Event',
        'Meetup',
        'Activity',
        'Community',
        'Announcement',
        'Other',
      ],
    },
    {
      key: 'date',
      label: 'Date',
      placeholder: 'e.g. 15 September',
    },
    {
      key: 'time',
      label: 'Time',
      placeholder: 'e.g. 18:00',
    },
    {
      key: 'location',
      label: 'Event location',
      placeholder: 'e.g. Moscow city centre',
    },
  ],
};

function getCharacteristicFields(
  categorySlug: string,
): CharacteristicField[] {
  return CHARACTERISTIC_FIELDS[categorySlug] ?? [];
}

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
    currency: initialValues?.currency ?? 'RUB',
    location: initialValues?.location ?? '',
    images: initialValues?.images ?? [],
    categorySlug:
      initialValues?.categorySlug ??
      categories[0]?.slug ??
      '',
    characteristics:
      initialValues?.characteristics ?? {},
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const characteristicFields = useMemo(
    () => getCharacteristicFields(values.categorySlug),
    [values.categorySlug],
  );

  useEffect(() => {
    setValues((current) => {
      const allowedKeys = new Set(
        characteristicFields.map((field) => field.key),
      );

      const filteredCharacteristics = Object.fromEntries(
        Object.entries(current.characteristics).filter(
          ([key]) => allowedKeys.has(key),
        ),
      );

      return {
        ...current,
        characteristics: filteredCharacteristics,
      };
    });
  }, [values.categorySlug, characteristicFields]);

  function update<K extends keyof ListingFormValues>(
    key: K,
    value: ListingFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateCharacteristic(
    key: string,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      characteristics: {
        ...current.characteristics,
        [key]: value,
      },
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    const cleanedCharacteristics = Object.fromEntries(
      Object.entries(values.characteristics).filter(
        ([, value]) => value.trim() !== '',
      ),
    );

  const payload = {
  title: values.title,
  description: values.description,
  price: values.price ? Number(values.price) : null,
  location: values.location,
  images: values.images,
  categorySlug: values.categorySlug,
  characteristics: cleanedCharacteristics,
};

    try {
      const res = await fetch(
        isEditing
          ? `/api/listings/${listingId}`
          : '/api/listings',
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
        throw new Error(
          data.error ?? 'Something went wrong.',
        );
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
    <form
      onSubmit={onSubmit}
      className="flex min-w-0 flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">
          Title
        </Label>

        <Input
          id="title"
          value={values.title}
          onChange={(e) =>
            update('title', e.target.value)
          }
          placeholder="e.g. Apartment near Moscow State University"
          required
          minLength={5}
          maxLength={120}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">
            Category
          </Label>

          <Select
            value={values.categorySlug}
            onValueChange={(value) =>
              update('categorySlug', value)
            }
          >
            <SelectTrigger id="category" className="w-full min-w-0">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.slug}
                >
                  {category.nameRu}
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
            onChange={(e) =>
              update('location', e.target.value)
            }
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
          onChange={(e) =>
            update('price', e.target.value)
          }
          placeholder="Leave blank for 'Price on request'"
        />
      </div>

      {characteristicFields.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-branch-900">
              Details
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add useful details so people can quickly understand what you are offering.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {characteristicFields.map((field) => (
              <div
                key={field.key}
                className="flex flex-col gap-2"
              >
                <Label htmlFor={`characteristic-${field.key}`}>
                  {field.label}
                </Label>

                {field.options ? (
                  <Select
                    value={
                      values.characteristics[field.key] ??
                      ''
                    }
                    onValueChange={(value) =>
                      updateCharacteristic(
                        field.key,
                        value,
                      )
                    }
                  >
                    <SelectTrigger
  id={`characteristic-${field.key}`}
  className="w-full min-w-0"
>
                      <SelectValue
                        placeholder={`Select ${field.label.toLowerCase()}`}
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem
                          key={option}
                          value={option}
                        >
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`characteristic-${field.key}`}
                    value={
                      values.characteristics[field.key] ??
                      ''
                    }
                    onChange={(e) =>
                      updateCharacteristic(
                        field.key,
                        e.target.value,
                      )
                    }
                    placeholder={field.placeholder}
                    maxLength={500}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
          placeholder="Describe what you are selling or offering, its condition, important details, selling conditions, and why you are selling."
          rows={8}
          required
          minLength={20}
          maxLength={5000}
        />

        <p className="text-xs text-muted-foreground">
          Include important conditions, what is included,
          and anything buyers should know before contacting you.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>
          Photos
        </Label>

        <ImageUploader
          images={values.images}
          onChange={(images) =>
            update('images', images)
          }
        />
      </div>

      {error && (
        <p className="break-words text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full sm:w-auto sm:self-start"
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
