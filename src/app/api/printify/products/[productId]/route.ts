import { NextResponse } from 'next/server';
import {
  deletePrintifyProduct,
  getPrintifyProduct,
  parsePrintifyError,
  updatePrintifyProduct
} from '@/lib/printify';
import type { PrintifyProduct } from '@/types/printify';

const errorResponse = (error: unknown) => {
  const parsed = parsePrintifyError(error);
  return NextResponse.json({ error: parsed.message, details: parsed.details }, { status: parsed.status });
};

const getShopId = (req: Request) => {
  const { searchParams } = new URL(req.url);
  return searchParams.get('shopId') || undefined;
};

interface Params {
  params: { productId: string };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const data = await getPrintifyProduct({ productId: params.productId, shopId: getShopId(req) });
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const body = (await req.json()) as Partial<PrintifyProduct> & { shopId?: string };
    const { shopId: shopIdOverride, ...payload } = body;
    const shopId = shopIdOverride || getShopId(req);

    const data = await updatePrintifyProduct({
      productId: params.productId,
      shopId,
      payload
    });

    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const data = await deletePrintifyProduct({ productId: params.productId, shopId: getShopId(req) });
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
