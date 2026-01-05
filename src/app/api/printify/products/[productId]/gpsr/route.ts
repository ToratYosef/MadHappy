import { NextResponse } from 'next/server';
import { getPrintifyProductGpsr, parsePrintifyError } from '@/lib/printify';

const errorResponse = (error: unknown) => {
  const parsed = parsePrintifyError(error);
  return NextResponse.json({ error: parsed.message, details: parsed.details }, { status: parsed.status });
};

interface Params {
  params: { productId: string };
}

const getShopId = (req: Request) => {
  const { searchParams } = new URL(req.url);
  return searchParams.get('shopId') || undefined;
};

export async function GET(req: Request, { params }: Params) {
  try {
    const data = await getPrintifyProductGpsr({ productId: params.productId, shopId: getShopId(req) });
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
