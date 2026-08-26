import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    bio: z.string().trim().max(500).optional(),
    location: z.string().trim().max(120).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;

  if (!sessionUser?.id) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { isBanned: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (currentUser.isBanned) {
    return NextResponse.json(
      { error: 'Your account has been banned and cannot update its profile.' },
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

  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: sessionUser.id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      location: true,
    },
  });

  return NextResponse.json({ user });
}