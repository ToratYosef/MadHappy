import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { shippingInfo: true }
    });

    return NextResponse.json({
      shippingInfo: user?.shippingInfo || {}
    });
  } catch (error: any) {
    console.error('Error fetching shipping info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping info' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const shippingInfo = await req.json();

    await prisma.user.update({
      where: { email: session.user.email },
      data: { shippingInfo }
    });

    return NextResponse.json({
      success: true,
      message: 'Shipping info saved'
    });
  } catch (error: any) {
    console.error('Error saving shipping info:', error);
    return NextResponse.json(
      { error: 'Failed to save shipping info' },
      { status: 500 }
    );
  }
}
