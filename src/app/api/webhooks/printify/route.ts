import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPrintifySignature } from '@/lib/printify';

type FulfillmentStatus = 'DRAFT' | 'SUBMITTED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

const statusMap: Record<string, FulfillmentStatus> = {
  'order:submitted': 'SUBMITTED',
  'order:created': 'SUBMITTED',
  'order:processing': 'PROCESSING',
  'order:printing': 'PROCESSING',
  'order:shipped': 'SHIPPED',
  'order:delivered': 'DELIVERED',
  'order:canceled': 'CANCELED'
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature =
    headers().get('printify-signature') ||
    headers().get('x-printify-signature') ||
    headers().get('x-pf-signature');

  if (!verifyPrintifySignature(rawBody, signature, process.env.PRINTIFY_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    console.error('Failed to parse Printify webhook payload', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    await prisma.webhookEvent.create({
      data: {
        source: 'printify',
        eventType: payload?.type || 'unknown',
        payload
      }
    });
  } catch (error) {
    console.error('Failed to persist Printify webhook', error);
  }

  const data = payload?.data || payload;
  const externalId = data?.external_id || data?.order?.external_id;
  const printifyOrderId = data?.id || data?.order_id || data?.order?.id;

  if (!externalId && !printifyOrderId) {
    return NextResponse.json({ ok: true });
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        externalId ? { id: externalId } : undefined,
        printifyOrderId ? { printifyOrderId } : undefined
      ].filter(Boolean) as any
    }
  });

  if (!order) {
    console.warn('Order not found for Printify webhook', { externalId, printifyOrderId });
    return NextResponse.json({ ok: true });
  }

  const updates: any = {};
  const mappedStatus =
    statusMap[payload?.type] ||
    statusMap[data?.status] ||
    statusMap[data?.fulfillment_status] ||
    undefined;

  if (mappedStatus) updates.fulfillmentStatus = mappedStatus;

  const tracking = data?.tracking_info || data?.tracking || data?.shipments?.[0];
  if (tracking) {
    updates.trackingCarrier = tracking.carrier || tracking.carrier_name || tracking.shipping_provider;
    updates.trackingNumber = tracking.number || tracking.tracking_number;
    updates.trackingUrl = tracking.url || tracking.tracking_url;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: updates
  });

  return NextResponse.json({ ok: true });
}
