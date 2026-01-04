import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }
  return session;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const updates: Record<string, any> = {};

    if (typeof body.title === 'string') updates.title = body.title.trim();
    if (typeof body.description === 'string') updates.description = body.description.trim();
    if (typeof body.slug === 'string') updates.slug = body.slug.trim();

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    const product = await prisma.printifyProductCache.update({
      where: { id: params.id },
      data: updates,
      include: { variants: true }
    });

    return NextResponse.json({ ok: true, product });
  } catch (error: any) {
    console.error('Failed to update Printify product', error);

    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    await prisma.printifyProductCache.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Failed to delete Printify product', error);

    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
