import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/queries/products';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || undefined;
  const sort = searchParams.get('sort') || undefined;

  const products = await getProducts({ search, sort });

  const sorted = sort?.startsWith('price')
    ? products.sort((a, b) => {
        const aPrice = a.variants[0]?.priceCents ?? 0;
        const bPrice = b.variants[0]?.priceCents ?? 0;
        return sort === 'price-desc' ? bPrice - aPrice : aPrice - bPrice;
      })
    : products;

  return NextResponse.json({ products: sorted });
}
