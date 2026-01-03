import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { submitPrintifyOrder, requirePrintifyConfig } from '@/lib/printify';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const { token, shopId } = requirePrintifyConfig();

    // Fetch the order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Skip if already synced to Printify
    if (order.printifyOrderId) {
      return NextResponse.json({ message: 'Order already synced', printifyOrderId: order.printifyOrderId });
    }

    // Build Printify order payload
    const lineItems = order.items
      .filter((item) => item.printifyProductId && item.variantId)
      .map((item) => ({
        product_id: item.printifyProductId as string,
        variant_id: item.variantId as string | number,
        quantity: item.qty
      }));

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No valid items to submit to Printify' }, { status: 400 });
    }

    const payload = {
      external_id: order.id,
      line_items: lineItems,
      shipping_method: 1, // Standard shipping - check Printify docs for ID
      send_shipping_notification: true,
      address_to: {
        first_name: order.shippingName?.split(' ')[0] || 'Customer',
        last_name: order.shippingName?.split(' ').slice(1).join(' ') || '',
        email: order.customerEmail,
        phone: null,
        country: order.shippingCountry || 'US',
        region: order.shippingState || '',
        address1: order.shippingAddress1 || '',
        address2: order.shippingAddress2 || '',
        city: order.shippingCity || '',
        zip: order.shippingPostal || ''
      }
    };

    console.log('Submitting Printify order:', payload);
    // Submit to Printify
    const printifyOrder = await submitPrintifyOrder(shopId, payload, token);

    console.log('Printify order created:', printifyOrder);

    // Update order with Printify order ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        printifyOrderId: printifyOrder.id,
        fulfillmentStatus: 'SUBMITTED'
      }
    });

    return NextResponse.json({
      success: true,
      printifyOrderId: printifyOrder.id,
      printifyOrder
    });
  } catch (error) {
    console.error('Sync to Printify error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync order to Printify',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
