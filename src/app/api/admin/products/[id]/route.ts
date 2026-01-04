import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Params {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { title, description, slug } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        title,
        description,
        slug
      }
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Failed to update product', error);
    return NextResponse.json({ error: 'Failed to update product', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Failed to delete product', error);
    return NextResponse.json({ error: 'Failed to delete product', details: String(error) }, { status: 500 });
  }
}
