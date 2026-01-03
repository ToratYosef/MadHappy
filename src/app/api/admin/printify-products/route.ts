import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function normalizeImages(images: any): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => {
      if (typeof img === 'string') return img;
      if (img?.src) return img.src;
      if (img?.url) return img.url;
      return null;
    })
    .filter(Boolean) as string[];
}

export async function GET() {
  try {
    const products = await prisma.printifyProductCache.findMany({
      select: {
        id: true,
        title: true,
        printifyProductId: true,
        images: true,
        options: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 200
    });

    const mapped = products.map((p) => ({
      id: p.id,
      title: p.title,
      printifyProductId: p.printifyProductId,
      images: normalizeImages(p.images as any),
      options: Array.isArray(p.options) ? p.options : []
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, printifyProductId } = body || {};
    if (!id && !printifyProductId) {
      return NextResponse.json({ error: 'id or printifyProductId required' }, { status: 400 });
    }

    const record = id
      ? await prisma.printifyProductCache.findUnique({ where: { id } })
      : await prisma.printifyProductCache.findUnique({ where: { printifyProductId } });

    if (!record) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // delete variants and product
    await prisma.printifyVariantCache.deleteMany({ where: { productId: record.id } });
    await prisma.printifyProductCache.delete({ where: { id: record.id } });

    return NextResponse.json({ success: true, id: record.id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
