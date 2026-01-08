import { prisma } from './db';
import { listPrintifyOrders, submitPrintifyOrder, parsePrintifyError } from './printify';

type PrintifyOrderSummary = {
  id?: string;
  external_id?: string;
};

const extractOrders = (response: any): PrintifyOrderSummary[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.orders)) return response.orders;
  return [];
};

const findPrintifyOrderByExternalId = async (externalId: string) => {
  const maxPages = 5;
  const pageSize = 100;

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await listPrintifyOrders({ page, limit: pageSize });
    const orders = extractOrders(response);
    if (!orders.length) break;

    const match = orders.find((order) => order.external_id === externalId);
    if (match) return match;

    if (orders.length < pageSize) break;
  }

  return null;
};

interface OrderItem {
  productId: string;
  variantId: string;
  qty: number;
}

export async function submitOrderToPrintify(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { 
      items: true
    }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.paymentStatus !== 'PAID') {
    throw new Error('Order must be paid before sending to Printify');
  }

  if (order.printifyOrderId) {
    throw new Error('Order already submitted to Printify');
  }

  // Build Printify order payload
  const lineItems = await Promise.all(
    order.items.map(async (item) => {
      // Get the product to find Printify product ID
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true }
      });

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // The item.variantId is the Printify variant ID (stored as string)
      // The item.productId is our internal product ID
      // We need to use the Printify product ID which is stored in the product's id field
      
      return {
        product_id: item.productId, // This is actually the Printify product ID
        variant_id: parseInt(item.variantId), // Printify expects integer variant_id
        quantity: item.qty,
        external_id: item.id
      };
    })
  );

  const payload = {
    external_id: order.orderNumber || order.id,
    label: order.orderNumber || order.id.slice(0, 8),
    line_items: lineItems,
    shipping_method: 1, // Standard shipping
    send_shipping_notification: true,
    address_to: {
      first_name: order.shippingName?.split(' ')[0] || order.customerName?.split(' ')[0] || 'Customer',
      last_name: order.shippingName?.split(' ').slice(1).join(' ') || order.customerName?.split(' ').slice(1).join(' ') || 'Name',
      email: order.customerEmail,
      phone: order.customerPhone || '',
      country: order.shippingCountry || 'US',
      region: order.shippingState || '',
      address1: order.shippingAddress1 || '',
      address2: order.shippingAddress2 || '',
      city: order.shippingCity || '',
      zip: order.shippingPostal || ''
    }
  };

  console.log('📤 Submitting order to Printify:', JSON.stringify(payload, null, 2));

  try {
    const printifyOrder = await submitPrintifyOrder({ payload });

    // Store Printify order ID in our database
    await prisma.order.update({
      where: { id: order.id },
      data: {
        printifyOrderId: printifyOrder.id,
        fulfillmentStatus: 'SUBMITTED'
      }
    });

    return printifyOrder;
  } catch (error) {
    const parsedError = parsePrintifyError(error);
    console.error('Failed to submit order to Printify:', parsedError);

    const alreadyExists = parsedError.details?.errors?.reason?.includes('already exists');
    if (alreadyExists) {
      const existingOrder = await findPrintifyOrderByExternalId(payload.external_id);
      if (existingOrder?.id) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            printifyOrderId: existingOrder.id,
            fulfillmentStatus: 'SUBMITTED'
          }
        });
        return existingOrder;
      }
    }

    throw new Error(`Printify submission failed: ${parsedError.message}`);
  }
}
