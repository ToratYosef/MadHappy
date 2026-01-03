import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { productId, printifyProductId } = body || {};

    let where: any = {};

    if (productId) {
      where.productId = String(productId);
    } else if (printifyProductId) {
      const prod = await prisma.printifyProductCache.findUnique({
        where: { printifyProductId: String(printifyProductId) }
      });
      if (!prod) {
        return NextResponse.json({ ok: false, message: 'product not found' }, { status: 404 });
      }
      where.productId = prod.id;
    }

    await prisma.printifyVariantCache.updateMany({ where, data: { isEnabled: true } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message || 'error' }, { status: 500 });
  }
}
