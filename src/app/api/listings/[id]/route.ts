import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const listingIdSchema = z.string().cuid('Invalid listing ID.');

const uploadThingImageUrlSchema = z
  .string()
  .url('Each image must be a valid URL.')
  .refine(
    (value) => {
      try {
        const url = new URL(value);

        return (
          url.protocol === 'https:' &&
          url.hostname === 'utfs.io' &&
          url.pathname.startsWith('/f/')
        );
      } catch {
        return false;
      }
    },
    {
      message: 'Each image must be a valid UploadThing image URL.',
    }
  );

const statusSchema = z
  .object({
    status: z.enum(['ACTIVE', 'SOLD', 'ARCHIVED', 'REMOVED']),
  })
  .strict();

const editListingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, 'Title must be at least 5 characters.')
      .max(120),

    description: z
      .string()
      .trim()
      .min(20, 'Description must be at least 20 characters.')
      .max(5000),

    price: z
      .union([
        z.number().positive('Price must be greater than zero.'),
        z.null(),
      ])
      .optional(),

    location: z
      .string()
      .trim()
      .min(2, 'Location is required.')
      .max(120),

    images: z
      .array(uploadThingImageUrlSchema)
      .max(8)
      .default([]),

    categorySlug: z
      .string()
      .trim()
      .min(1, 'Category is required.')
      .max(80),
  })
  .strict();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  const userId = (
    session?.user as { id?: string } | undefined
  )?.id;

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  const parsedId = listingIdSchema.safeParse(params.id);

  if (!parsedId.success) {
    return NextResponse.json(
      { error: 'Invalid listing ID.' },
      { status: 400 }
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      isBanned: true,
    },
  });

  if (!currentUser) {
    return NextResponse.json(
      { error: 'User not found.' },
      { status: 404 }
    );
  }

  if (currentUser.isBanned) {
    return NextResponse.json(
      {
        error:
          'Your account has been banned and cannot update listings.',
      },
      { status: 403 }
    );
  }

  const existing = await prisma.listing.findUnique({
    where: {
      id: parsedId.data,
    },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!existing) {
    return NextResponse.json(
      { error: 'Listing not found.' },
      { status: 404 }
    );
  }

  if (existing.userId !== userId) {
    return NextResponse.json(
      {
        error: 'You can only update your own listings.',
      },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  /*
   * Status update
   */
  const parsedStatus = statusSchema.safeParse(body);

  if (parsedStatus.success) {
    const nextStatus = parsedStatus.data.status;

    if (nextStatus === 'REMOVED') {
      return NextResponse.json(
        {
          error:
            'Listings cannot be removed through this action.',
        },
        { status: 400 }
      );
    }

    if (existing.status === 'REMOVED') {
      return NextResponse.json(
        {
          error: 'Removed listings cannot be reactivated.',
        },
        { status: 400 }
      );
    }

    if (existing.status === nextStatus) {
      return NextResponse.json(
        {
          error: `Listing is already ${nextStatus.toLowerCase()}.`,
        },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.update({
      where: {
        id: existing.id,
      },
      data: {
        status: nextStatus,
      },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      listing,
    });
  }

  /*
   * Listing detail edit
   */
  const parsedEdit = editListingSchema.safeParse(body);

  if (!parsedEdit.success) {
    return NextResponse.json(
      {
        error:
          parsedEdit.error.issues[0]?.message ??
          'Invalid listing data.',
      },
      { status: 400 }
    );
  }

  const {
    categorySlug,
    ...data
  } = parsedEdit.data;

  const category = await prisma.category.findUnique({
    where: {
      slug: categorySlug,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    return NextResponse.json(
      {
        error: 'Unknown category.',
      },
      { status: 400 }
    );
  }

  if (existing.status === 'REMOVED') {
    return NextResponse.json(
      {
        error: 'Removed listings cannot be edited.',
      },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.update({
    where: {
      id: existing.id,
    },
    data: {
      ...data,
      price: data.price ?? null,
      categoryId: category.id,
    },
    include: {
      category: {
        select: {
          slug: true,
          nameRu: true,
          nameEn: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json({
    listing,
  });
}