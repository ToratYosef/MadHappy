import { NextResponse } from 'next/server';
import { syncPrintifyProducts } from '@/lib/printify-sync';
import { parsePrintifyError } from '@/lib/printify';

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get('shopId') || undefined;

  try {
    const result = await syncPrintifyProducts(shopId);
    return NextResponse.json(result);
  } catch (error) {
    const parsed = parsePrintifyError(error);
    return NextResponse.json({ error: parsed.message, details: parsed.details }, { status: parsed.status });
  }
}
