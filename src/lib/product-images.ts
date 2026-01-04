import type { ProductImage } from '@/types/product';

const toIdString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') {
    const fromObject =
      (value as any).id ?? (value as any).variantId ?? (value as any).value ?? (value as any).valueId;
    if (fromObject !== null && fromObject !== undefined) return String(fromObject);
    return null;
  }
  return String(value);
};

const normalizeVariantIds = (variantId?: string | string[] | Record<string, unknown> | null): string[] => {
  if (!variantId) return [];
  const ids = Array.isArray(variantId) ? variantId : [variantId];
  return Array.from(new Set(ids.map(toIdString).filter((id): id is string => Boolean(id))));
};

const getVariantIds = (img: any): string[] => {
  const raw = img?.variantIds ?? img?.variant_ids ?? img?.variants;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((id) => toIdString(id))
    .filter((id): id is string => Boolean(id));
};

/**
 * Narrow a product's images to those associated with the given variant ID.
 * Falls back to a default image, then any generic/unscoped image, then all images.
 */
export const filterImagesByVariant = (
  images: ProductImage[] = [],
  variantId?: string | string[] | null
): ProductImage[] => {
  if (!Array.isArray(images)) return [];

  const normalizedVariantIds = normalizeVariantIds(variantId);
  const matching = normalizedVariantIds.length
    ? images.filter((img) => {
        const imgVariantIds = getVariantIds(img);
        return imgVariantIds.length > 0 && imgVariantIds.some((id) => normalizedVariantIds.includes(id));
      })
    : [];

  if (matching.length) return matching;

  const defaultImage = images.find((img) => img.isDefault);
  if (defaultImage) {
    const rest = images.filter((img) => img !== defaultImage);
    return [defaultImage, ...rest];
  }

  const generic = images.filter((img) => getVariantIds(img).length === 0);
  return generic.length ? generic : images;
};

export const getFeaturedImage = (images: ProductImage[] = [], variantId?: string | null) =>
  filterImagesByVariant(images, variantId)[0] ?? null;
