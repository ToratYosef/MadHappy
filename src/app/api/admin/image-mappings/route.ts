import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'image-color-mappings.json');

async function readStore() {
  try {
    const raw = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    return {};
  }
}

async function writeStore(obj: any) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(obj, null, 2), 'utf-8');
}

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store);
}

/**
 * POST body: { productId: string, mappings: Record<string, string> }
 * This will merge mappings for the given productId.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, mappings } = body;
    if (!productId || typeof mappings !== 'object') {
      return NextResponse.json({ error: 'productId and mappings required' }, { status: 400 });
    }

    const store = await readStore();
    store[productId] = {
      ...(store[productId] || {}),
      ...mappings
    };

    await writeStore(store);
    return NextResponse.json({ success: true, productId, mappings: store[productId] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
