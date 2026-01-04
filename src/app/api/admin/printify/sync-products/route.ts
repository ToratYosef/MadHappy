import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrintifyConfigError, requirePrintifyConfig } from '@/lib/printify';
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
  } catch (error: any) {
    console.error('Printify sync failed', error);

    if (error instanceof PrintifyConfigError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const status = typeof error?.status === 'number' ? error.status : 500;
    const message =
      typeof error?.message === 'string'
        ? error.message
        : 'Unexpected error during Printify sync';

    return NextResponse.json({ error: message }, { status });
  }
}
