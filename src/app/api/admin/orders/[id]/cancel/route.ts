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

    // Cancel in Printify if order was submitted
    if (order.printifyOrderId) {
      try {
        await cancelPrintifyOrder({ orderId: order.printifyOrderId });
      } catch (error) {
        const parsedError = parsePrintifyError(error);
        console.error('Failed to cancel order in Printify:', parsedError);
        // Continue to cancel in our system even if Printify fails
      }
    }

    // Update order status in our database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        fulfillmentStatus: 'CANCELLED'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Order cancelled'
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
