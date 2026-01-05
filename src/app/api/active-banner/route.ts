import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const banner = await prisma.banner.findFirst({
      where: { active: true },
      include: { promoCode: true },
      orderBy: { sortOrder: 'asc' }
    });

    if (!banner || !banner.promoCode) {
      return NextResponse.json({ banner: null });
    }

    return NextResponse.json({
      banner: {
        id: banner.id,
        text: banner.text || undefined,
        link: banner.link || undefined,
        promoCode: {
          code: banner.promoCode.code,
          type: banner.promoCode.type,
          discount: banner.promoCode.discount,
          flatDiscount: banner.promoCode.flatDiscount || undefined,
          minOrderAmount: banner.promoCode.minOrderAmount || undefined,
          maxDiscount: banner.promoCode.maxDiscount || undefined,
          maxUses: banner.promoCode.maxUses || undefined,
          currentUses: banner.promoCode.currentUses,
          expiresAt: banner.promoCode.expiresAt?.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch banner:', error);
    return NextResponse.json({ banner: null });
  }
}
