import { NextResponse } from 'next/server';
import { parsePrintifyError, publishPrintifyProduct } from '@/lib/printify';
import type { PrintifyPublishRequest } from '@/types/printify';

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

export async function POST(req: Request, { params }: Params) {
  try {
    const body = (await req.json()) as PrintifyPublishRequest & { shopId?: string };
    const { shopId: shopIdOverride, ...payload } = body;
    const shopId = shopIdOverride || getShopId(req);

    const data = await publishPrintifyProduct({
      productId: params.productId,
      shopId,
      payload
    });

    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
