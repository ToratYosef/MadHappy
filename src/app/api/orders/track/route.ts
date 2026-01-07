import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { orderNumber } = await req.json();

    if (!orderNumber || typeof orderNumber !== 'string') {
      return NextResponse.json({ error: 'Order number is required.' }, { status: 400 });
    }

    const trimmed = orderNumber.trim();
    if (!trimmed) {
      return NextResponse.json({ error: 'Order number is required.' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: trimmed }, { id: trimmed }]
      },
      select: {
        id: true,
        orderNumber: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        trackingCarrier: true,
        trackingNumber: true,
        trackingUrl: true,
        currency: true,
        promoCode: true,
        subtotalCents: true,
        discountCents: true,
        taxCents: true,
        shippingCents: true,
        totalCents: true,
        shippingAddress1: true,
        shippingAddress2: true,
        shippingCity: true,
        shippingState: true,
        shippingPostal: true,
        shippingCountry: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            title: true,
            variantTitle: true,
            imageUrl: true,
            options: true,
            qty: true,
            priceCents: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'We could not find that order.' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order.' }, { status: 500 });
  }
}
