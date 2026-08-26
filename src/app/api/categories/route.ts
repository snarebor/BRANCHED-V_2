import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { nameRu: 'asc' } });
  return NextResponse.json({ categories });
}
