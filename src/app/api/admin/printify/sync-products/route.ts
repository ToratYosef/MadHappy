import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { requirePrintifyConfig } from '@/lib/printify';
import { syncPrintifyCatalog } from '@/lib/printify-sync';

export async function POST() {
  const session = await getAuthSession();

  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { shopId, token } = requirePrintifyConfig();
    const summary = await syncPrintifyCatalog(shopId, token);

    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    console.error('Printify sync failed', error);
    return NextResponse.json({ error: 'Failed to sync products', details: String(error) }, { status: 500 });
  }
}
