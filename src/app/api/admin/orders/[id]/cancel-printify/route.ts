import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cancelPrintifyOrder, parsePrintifyError } from '@/lib/printify';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.printifyOrderId) {
      return NextResponse.json({ error: 'Order has no Printify ID' }, { status: 400 });
    }

    try {
      await cancelPrintifyOrder({ orderId: order.printifyOrderId });
    } catch (error) {
      const parsedError = parsePrintifyError(error);
      console.error('Failed to cancel order in Printify:', parsedError);
      return NextResponse.json(
        { error: parsedError.message || 'Failed to cancel order in Printify' },
        { status: parsedError.status ?? 500 }
      );
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: 'CANCELLED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Order cancelled in Printify and locally'
    });
  } catch (error: any) {
    console.error('Error cancelling Printify order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel Printify order' },
      { status: 500 }
    );
  }
}
