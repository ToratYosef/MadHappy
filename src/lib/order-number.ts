import { prisma } from './db';

export async function generateOrderNumber(): Promise<string> {
  // Get all orders and find the highest number to avoid race conditions
  const orders = await prisma.order.findMany({
    select: { orderNumber: true },
    orderBy: { createdAt: 'desc' },
    take: 100 // Get recent orders to find the highest number
  });

  let maxNumber = 1000; // Start from 1000, so first order is LKH-01001
  
  for (const order of orders) {
    if (order.orderNumber) {
      const match = order.orderNumber.match(/LKH-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }
  }

  const nextNumber = maxNumber + 1;
  return `LKH-${String(nextNumber).padStart(5, '0')}`;
}
