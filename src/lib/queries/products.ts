import { prisma } from '../db';
import { Prisma } from '@prisma/client';
import type { PrintifyImage, PrintifyProduct, PrintifyVariant } from '@/types/printify';

const productInclude: Prisma.PrintifyProductCacheInclude = {
  variants: {
    where: { isEnabled: true },
    orderBy: { priceCents: 'asc' }
  }
};

const normalizeImages = (images: any): PrintifyImage[] =>
  Array.isArray(images)
    ? images
        .map((img): PrintifyImage | null => {
          if (!img) return null;
          const url =
            (typeof img === 'string' ? img : img.url || img.src || img.preview || img.preview_url) || null;
          if (!url) return null;
          const rawVariantIds = (img as any).variantIds || (img as any).variant_ids || (img as any).variants;
          const variantIds = Array.isArray(rawVariantIds)
            ? rawVariantIds.map((id: any) => String(id)).filter(Boolean)
            : undefined;
          const isDefault = Boolean((img as any).isDefault ?? (img as any).is_default ?? false);
          return { url, variantIds, isDefault };
        })
        .filter((img): img is PrintifyImage => Boolean(img))
    : [];

const limitOptionValuesToVariants = (options: any[], variants: PrintifyVariant[]) => {
  if (!Array.isArray(options)) return [];
  const normalizedVariants = Array.isArray(variants) ? variants : [];

  return options.map((opt: any) => {
    const name = opt?.name || 'Option';
    const valueIdMap = opt?.valueIdMap || opt?.value_id_map || undefined;
    const valuesFromVariants = normalizedVariants.flatMap((variant) => {
      const entries = Object.entries(variant.options || {});
      const match = entries.find(
        ([key]) => key === name || key.toLowerCase() === name.toLowerCase()
      );
      return match ? [String(match[1])] : [];
    });

    const uniqueValues = Array.from(new Set(valuesFromVariants.map((v) => String(v)))).filter(
      (v) => v.trim().length > 0
    );
    const baseValues = (Array.isArray(opt?.values) ? opt.values : []).map((v) => String(v));

    return {
      name,
      values: uniqueValues.length ? uniqueValues : baseValues,
      valueIdMap: valueIdMap && typeof valueIdMap === 'object' ? valueIdMap : undefined
    };
  });
};

export const mapPrintifyProduct = (record: any): PrintifyProduct => ({
  id: record.id,
  shopId: record.shopId,
  printifyProductId: record.printifyProductId,
  title: record.title,
  slug: record.slug,
  description: record.description,
  images: normalizeImages(record.images),
  options: limitOptionValuesToVariants(
    Array.isArray(record.options)
      ? record.options.map((opt: any) => ({
          name: opt?.name || 'Option',
          values: Array.isArray(opt?.values) ? opt.values : [],
          valueIdMap:
            opt?.valueIdMap && typeof opt.valueIdMap === 'object'
              ? opt.valueIdMap
              : opt?.value_id_map && typeof opt.value_id_map === 'object'
                ? opt.value_id_map
                : undefined
        }))
      : [],
    (record.variants || []).map((variant: any) => ({
      id: variant.id,
      variantId: variant.variantId,
      title: variant.title,
      options: variant.options || {},
      priceCents: variant.priceCents,
      isEnabled: variant.isEnabled,
      shippingInfo: variant.shippingInfo
    }))
  ),
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
  const products = await prisma.printifyProductCache.findMany({
    include: productInclude,
    orderBy: { updatedAt: 'desc' },
    take: 8
  });
  return products.map(mapPrintifyProduct);
};

export const getProducts = async (params: { search?: string; sort?: string }) => {
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
  const product = await prisma.printifyProductCache.findFirst({
    where: {
      OR: [{ slug }, { printifyProductId: slug }]
    },
    include: productInclude
  });

  return product ? mapPrintifyProduct(product) : null;
};
