import { prisma } from '../db';
import type { Product, ProductImage, ProductVariant } from '@/types/product';

const normalizeImages = (images: any): ProductImage[] =>
  Array.isArray(images)
    ? images
        .map((img): ProductImage | null => {
          if (!img) return null;
          const url =
            (typeof img === 'string' ? img : img.url || img.src || img.preview || img.preview_url) || null;
          if (!url) return null;
          const rawVariantIds = (img as any).variantIds || (img as any).variant_ids || (img as any).variants;
          const variantIds = Array.isArray(rawVariantIds)
            ? rawVariantIds.map((id: any) => (id == null ? null : String(typeof id === 'object' ? id.id ?? id : id))).filter(Boolean)
            : undefined;
          const isDefault = Boolean((img as any).isDefault ?? (img as any).is_default ?? false);
          return { url, variantIds, isDefault };
        })
        .filter((img): img is ProductImage => Boolean(img))
    : [];

const normalizeOptions = (options: any): Product['options'] =>
  Array.isArray(options)
    ? options.map((opt: any) => ({
        name: opt?.name || 'Option',
        values: Array.isArray(opt?.values) ? opt.values.map((v: any) => String(v)) : [],
        valueIdMap:
          opt?.valueIdMap && typeof opt.valueIdMap === 'object'
            ? opt.valueIdMap
            : opt?.value_id_map && typeof opt.value_id_map === 'object'
              ? opt.value_id_map
              : undefined
      }))
    : [];

const mapVariants = (variants: any[] = []): ProductVariant[] =>
  variants
    .map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      title: variant.title,
      options: variant.options || {},
      priceCents: variant.priceCents,
      isEnabled: variant.isEnabled,
      shippingInfo: variant.shippingInfo
    }))
    .sort((a, b) => a.priceCents - b.priceCents);

export const mapProduct = (record: any): Product => {
  const variants = mapVariants(record.variants || []);
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    description: record.description,
    images: normalizeImages(record.images),
    options: normalizeOptions(record.options),
    variants,
    createdAt: record.createdAt || new Date(),
    updatedAt: record.updatedAt || new Date()
  };
};

export const getFeaturedProducts = async () => {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { updatedAt: 'desc' },
    take: 8
  });
  const normalized = products.map(mapProduct);
  return normalized
    .map((product) => ({ ...product, variants: product.variants.filter((v) => v.isEnabled) }))
    .filter((p) => p.variants.length);
};

export const getProducts = async (params: { search?: string; sort?: string }) => {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { updatedAt: 'desc' }
  });

  const filtered = params.search
    ? products.filter((p: any) => {
        const haystack = `${p.title} ${p.description}`.toLowerCase();
        return haystack.includes(params.search!.toLowerCase());
      })
    : products;

  const normalized = filtered.map(mapProduct).map((product) => ({
    ...product,
    variants: product.variants.filter((v) => v.isEnabled)
  }));

  return normalized.filter((p) => p.variants.length);
};

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findFirst({
    where: { slug },
    include: { variants: true }
  });

  if (!product) return null;
  const mapped = mapProduct(product);
  return { ...mapped, variants: mapped.variants.filter((v) => v.isEnabled) };
};
