import { NextResponse } from 'next/server';
import { calculateTax } from '@/lib/tax';

export async function POST(req: Request) {
  try {
    const { subtotalCents, state, zipCode } = await req.json();

    if (!zipCode && !state) {
      return NextResponse.json(
        { error: 'Zip code or state is required' },
        { status: 400 }
      );
    }

    if (!subtotalCents || typeof subtotalCents !== 'number') {
      return NextResponse.json(
        { error: 'Subtotal is required' },
        { status: 400 }
      );
    }

    const taxCents = calculateTax(subtotalCents, zipCode || '', state);

    return NextResponse.json({ taxCents });
  } catch (error: any) {
    console.error('Error calculating tax:', error);
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
      { status: 500 }
    );
  }
}
