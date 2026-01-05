import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { submitOrderToPrintify } from '@/lib/printify-order';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orderId = params.id;
    const printifyOrder = await submitOrderToPrintify(orderId);

    return NextResponse.json({ 
      success: true, 
      message: 'Order submitted to Printify',
      printifyOrderId: printifyOrder.id
    });
  } catch (error: any) {
    console.error('Error submitting order to Printify:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit order' },
      { status: 500 }
    );
  }
}
