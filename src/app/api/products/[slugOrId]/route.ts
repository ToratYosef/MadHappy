import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/lib/queries/products';

export async function GET(_: Request, { params }: { params: { slugOrId: string } }) {
  const product = await getProductBySlug(params.slugOrId);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ product });
}
