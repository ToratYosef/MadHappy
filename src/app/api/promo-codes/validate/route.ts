import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code, subtotalCents } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { tiers: { orderBy: { minAmount: 'desc' } } }
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    if (!promoCode.active) {
      return NextResponse.json(
        { error: 'Promo code is no longer active' },
        { status: 400 }
      );
    }

    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      return NextResponse.json(
        { error: 'Promo code has expired' },
        { status: 400 }
      );
    }

    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return NextResponse.json(
        { error: 'Promo code has reached maximum uses' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (promoCode.minOrderAmount && subtotalCents < promoCode.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount is $${(promoCode.minOrderAmount / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    let freeShipping = false;

    switch (promoCode.type) {
      case 'PERCENTAGE':
        discountAmount = Math.round((subtotalCents * promoCode.discount) / 100);
        if (promoCode.maxDiscount) {
          discountAmount = Math.min(discountAmount, promoCode.maxDiscount);
        }
        break;

      case 'FLAT_AMOUNT':
        discountAmount = promoCode.flatDiscount || 0;
        break;

      case 'FREE_SHIPPING':
        freeShipping = true;
        discountAmount = 0;
        break;

      case 'TIERED':
        // Find the applicable tier
        const applicableTier = promoCode.tiers.find(tier => subtotalCents >= tier.minAmount);
        if (applicableTier) {
          discountAmount = applicableTier.discount;
        }
        break;
    }

    return NextResponse.json({
      code: promoCode.code,
      type: promoCode.type,
      discount: promoCode.discount,
      discountAmount,
      freeShipping,
      flatDiscount: promoCode.flatDiscount,
      maxDiscount: promoCode.maxDiscount
    });
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
