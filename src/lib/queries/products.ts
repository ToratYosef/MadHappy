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
    const rawValueIdMap = opt?.valueIdMap || opt?.value_id_map || undefined;

    // Collect raw value ids from variants for this option name
    const valuesFromVariants = normalizedVariants.flatMap((variant) => {
      const entries = Object.entries(variant.options || {});
      const match = entries.find(
        ([key]) => key === name || key.toLowerCase() === name.toLowerCase()
      );
      return match ? [String(match[1])] : [];
    });

    const uniqueValueIds = Array.from(new Set(valuesFromVariants.map((v) => String(v)))).filter(
      (v) => v.trim().length > 0
    );
    const baseValues = (Array.isArray(opt?.values) ? opt.values : []).map((v) => String(v));

    // Build a mapping from value id -> label
    const valueIdMap: Record<string, string> | undefined = rawValueIdMap && typeof rawValueIdMap === 'object'
      ? Object.fromEntries(Object.entries(rawValueIdMap).map(([k, v]) => [String(k), String(v)]))
      : undefined;

    const buildLabelForId = (id: string) => {
      // Prefer provided mapping
      if (valueIdMap && valueIdMap[id]) return valueIdMap[id];

      // Fallback: try to infer from variant title (common Printify format: "Title / SIZE")
      const found = normalizedVariants.find((variant) => {
        const entries = Object.entries(variant.options || {});
        return entries.some(([, v]) => String(v) === id);
      });
      if (found && typeof found.title === 'string') {
        const parts = found.title.split('/').map((p) => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          const last = parts[parts.length - 1];
          // If last part looks like a size (1-3 chars or contains letters), use it
          if (/^[A-Za-z0-9\-\+]{1,6}$/.test(last)) return last;
        }
      }

      // As a final fallback, if baseValues includes a matching id->label mapping, use it
      const baseMatch = baseValues.find((bv) => String(bv) === id);
      if (baseMatch) return baseMatch;

      return id;
    };

    const finalValues = uniqueValueIds.length
      ? uniqueValueIds.map((id) => buildLabelForId(id))
      : baseValues;

    // Also expose a valueIdMap from ids -> labels so UI can map back if needed
    const exposedValueIdMap = uniqueValueIds.length
      ? Object.fromEntries(uniqueValueIds.map((id) => [id, buildLabelForId(id)]))
      : valueIdMap;

    return {
      name,
      values: finalValues,
      valueIdMap: exposedValueIdMap
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
