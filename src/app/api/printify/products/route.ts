import { NextResponse } from 'next/server';
import { createPrintifyProduct, listPrintifyProducts, parsePrintifyError } from '@/lib/printify';
import type { PrintifyProduct } from '@/types/printify';

const toNumber = (value: string | null) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const errorResponse = (error: unknown) => {
  const parsed = parsePrintifyError(error);
  return NextResponse.json({ error: parsed.message, details: parsed.details }, { status: parsed.status });
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = toNumber(searchParams.get('limit'));
  const page = toNumber(searchParams.get('page'));
  const shopId = searchParams.get('shopId') || undefined;

  try {
    const data = await listPrintifyProducts({ shopId, limit, page });
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<PrintifyProduct> & { shopId?: string };
    const { shopId: shopIdOverride, ...payload } = body;
    const shopId = shopIdOverride || undefined;

    if (
      !payload.title ||
      !payload.description ||
      !payload.blueprint_id ||
      !payload.print_provider_id ||
      !payload.variants ||
      !payload.print_areas
    ) {
      return NextResponse.json(
        { error: 'Product payload is missing required Printify fields.' },
        { status: 400 }
      );
    }

    const data = await createPrintifyProduct({ shopId, payload: payload as PrintifyProduct });
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
