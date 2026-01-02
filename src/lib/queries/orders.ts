import { prisma } from '../db';
import { Prisma } from '@prisma/client';

export const getRecentOrders = (limit = 5) =>
  prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { items: true }
  });

export const getOrders = async (params: {
  paymentStatus?: string;
  fulfillmentStatus?: string;
  search?: string;
  skip?: number;
  take?: number;
}) => {
  const where: Prisma.OrderWhereInput = {};
  if (params.paymentStatus) where.paymentStatus = params.paymentStatus as any;
  if (params.fulfillmentStatus) where.fulfillmentStatus = params.fulfillmentStatus as any;
  if (params.search)
    where.OR = [
      { customerEmail: { contains: params.search, mode: 'insensitive' } },
      { id: { contains: params.search, mode: 'insensitive' } }
    ];

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take ?? 20,
      include: { items: true }
    }),
    prisma.order.count({ where })
  ]);

  return { orders, total };
};

export const getOrderById = (id: string) => prisma.order.findUnique({ where: { id }, include: { items: true } });
