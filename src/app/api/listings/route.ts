import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listingRateLimit } from '@/lib/rate-limit';

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
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
const createListingSchema = z
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

const listingQuerySchema = z.object({
  category: z.string().trim().min(1).max(80).optional(),

  location: z.string().trim().min(1).max(120).optional(),

  q: z.string().trim().min(1).max(120).optional(),

  sort: z
    .enum(['newest', 'price_asc', 'price_desc'])
    .default('newest'),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .max(10000)
    .default(1),

  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(PAGE_SIZE),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsedQuery = listingQuerySchema.safeParse({
    category: searchParams.get('category') ?? undefined,
    location: searchParams.get('location') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error:
          parsedQuery.error.issues[0]?.message ??
          'Invalid search parameters.',
      },
      { status: 400 }
    );
  }

  const {
    category,
    location,
    q,
    sort,
    page,
    pageSize,
  } = parsedQuery.data;

  const where: Prisma.ListingWhereInput = {
    status: 'ACTIVE',
    isFlagged: false,
    OR: [
      {
        expiresAt: null,
      },
      {
        expiresAt: {
          gt: new Date(),
        },
      },
    ],
  };

  if (category) {
    where.category = {
      slug: category,
    };
  }

  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive',
    };
  }

  if (q) {
    where.AND = [
      {
        OR: [
          {
            title: {
              contains: q,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: q,
              mode: 'insensitive',
            },
          },
        ],
      },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,

      orderBy:
        sort === 'price_asc'
          ? { price: 'asc' }
          : sort === 'price_desc'
            ? { price: 'desc' }
            : { createdAt: 'desc' },

      skip: (page - 1) * pageSize,
      take: pageSize,

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
    }),

    prisma.listing.count({
      where,
    }),
  ]);

  return NextResponse.json({
    listings,

    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const user =
    session?.user as { id?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json(
      {
        error: 'You must be logged in to post a listing.',
      },
      { status: 401 }
    );
  }
  const rateLimitResult = await listingRateLimit.limit(`user:${user.id}`);

if (!rateLimitResult.success) {
  return NextResponse.json(
    {
      error: 'Too many listings created. Please try again later.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(
          Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        ),
      },
    }
  );
}

  const currentUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },

    select: {
      isBanned: true,
    },
  });

  if (!currentUser) {
    return NextResponse.json(
      {
        error: 'User not found.',
      },
      { status: 404 }
    );
  }

  if (currentUser.isBanned) {
    return NextResponse.json(
      {
        error:
          'Your account has been banned and cannot create listings.',
      },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: 'Invalid JSON body.',
      },
      { status: 400 }
    );
  }

  const parsed = createListingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          'Invalid input.',
      },
      { status: 400 }
    );
  }

  const {
    categorySlug,
    ...data
  } = parsed.data;

  const category = await prisma.category.findUnique({
    where: {
      slug: categorySlug,
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

  const listing = await prisma.listing.create({
    data: {
      ...data,

      price: data.price ?? null,

      categoryId: category.id,

      userId: user.id,

      status: 'ACTIVE',

      isFlagged: false,

      expiresAt: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
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

  return NextResponse.json(
    {
      listing,
    },
    {
      status: 201,
    }
  );
}