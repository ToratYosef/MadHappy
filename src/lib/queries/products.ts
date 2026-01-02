import { prisma } from '../db';
import { Prisma } from '@prisma/client';

export const getFeaturedProducts = () =>
  prisma.product.findMany({
    where: { active: true, featured: true },
    include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true },
    orderBy: { createdAt: 'desc' },
    take: 8
  });

export const getProducts = (params: { category?: string; search?: string; sort?: string }) => {
  const where: Prisma.ProductWhereInput = { active: true };
  if (params.category) where.category = params.category as any;
  if (params.search)
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } }
    ];

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (params.sort === 'price-asc') orderBy = { priceCents: 'asc' };
  if (params.sort === 'price-desc') orderBy = { priceCents: 'desc' };

  return prisma.product.findMany({ where, orderBy, include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true } });
};

export const getProductBySlug = (slug: string) =>
  prisma.product.findUnique({ where: { slug }, include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true } });
