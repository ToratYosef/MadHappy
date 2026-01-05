import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { orderNumber, productId } = await req.json();

    if (!orderNumber || !productId) {
      return NextResponse.json({ valid: false, message: 'Order number and product ID required' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderNumber,
        paymentStatus: 'PAID'
      },
      include: {
        items: {
          where: {
            productId: productId
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ valid: false, message: 'Order not found or not paid' }, { status: 404 });
    }

    if (order.items.length === 0) {
      return NextResponse.json({ valid: false, message: 'This product was not in your order' }, { status: 404 });
    }

    return NextResponse.json({ valid: true, orderEmail: order.customerEmail });
  } catch (error: any) {
    console.error('Failed to validate order', error);
    return NextResponse.json({ valid: false, message: 'Failed to validate order' }, { status: 500 });
  }
}
