import { prisma } from '../db';
import { Prisma } from '@prisma/client';
import type { PrintifyImage, PrintifyProduct } from '@/types/printify';

const productInclude = {
  variants: {
    where: { isEnabled: true },
    orderBy: { priceCents: Prisma.SortOrder.asc }
  }
} satisfies Prisma.PrintifyProductCacheInclude;

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const normalizeImages = (images: any): PrintifyImage[] =>
  Array.isArray(images)
    ? images
        .map((img) => {
          if (typeof img === 'string') return { url: img, variantIds: [] };
          const url = img?.src || img?.url || img?.preview || null;
          if (url) {
            return {
              url,
              variantIds: Array.isArray(img?.variant_ids || img?.variantIds)
                ? (img.variant_ids || img.variantIds).map((id: any) => String(id))
                : undefined,
              position: img?.position ?? img?.camera_label ?? null,
              isDefault: Boolean(img?.is_default ?? img?.isDefault)
            } as PrintifyImage;
          }
          return null;
        })
        .filter(Boolean) as PrintifyImage[]
    : [];

export const mapPrintifyProduct = (record: any): PrintifyProduct => ({
  id: record.id,
  shopId: record.shopId,
  printifyProductId: record.printifyProductId,
  title: record.title,
  slug: record.slug,
  description: record.description,
  images: normalizeImages(record.images),
  options: Array.isArray(record.options)
    ? record.options.map((opt: any) => ({
        name: opt?.name || 'Option',
        values: Array.isArray(opt?.values) ? opt.values : []
      }))
    : [],
  variants: (record.variants || []).map((variant: any) => ({
    id: variant.id,
    variantId: variant.variantId,
    title: variant.title,
    options: variant.options || {},
    priceCents: variant.priceCents,
    isEnabled: variant.isEnabled,
    shippingInfo: variant.shippingInfo
  })),
  updatedAt: record.updatedAt
});

export const getFeaturedProducts = async () => {
  if (!hasDatabaseUrl) return [];
  const products = await prisma.printifyProductCache.findMany({
    include: productInclude,
    orderBy: { updatedAt: 'desc' },
    take: 8
  });
  return products.map(mapPrintifyProduct);
};

export const getProducts = async (params: { search?: string; sort?: string }) => {
  if (!hasDatabaseUrl) return [];
  const where: Prisma.PrintifyProductCacheWhereInput = {};
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } }
    ];
  }

  const products = await prisma.printifyProductCache.findMany({
    where,
    include: productInclude,
    orderBy: { updatedAt: 'desc' }
  });

  return products.map(mapPrintifyProduct);
};

export const getProductBySlug = async (slug: string) => {
  if (!hasDatabaseUrl) return null;
  const product = await prisma.printifyProductCache.findFirst({
    where: {
      OR: [{ slug }, { printifyProductId: slug }]
    },
    include: productInclude
  });

  return product ? mapPrintifyProduct(product) : null;
};
