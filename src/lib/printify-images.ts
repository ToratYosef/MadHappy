import type { PrintifyImage } from '@/types/printify';

const normalizeVariantIds = (variantId?: string | string[] | null): string[] => {
  if (!variantId) return [];
  const ids = Array.isArray(variantId) ? variantId : [variantId];
  return Array.from(new Set(ids.map((id) => String(id)).filter(Boolean)));
};

const getVariantIds = (img: any): string[] => {
  const raw = img?.variantIds ?? img?.variant_ids ?? img?.variants;
  if (!Array.isArray(raw)) return [];
  return raw.map((id) => String(id)).filter(Boolean);
};

/**
 * Narrow a product's images to those associated with the given variant ID.
 * Falls back to a default image, then any generic/unscoped image, then all images.
 */
export const filterImagesByVariant = (
  images: PrintifyImage[] = [],
  variantId?: string | string[] | null
): PrintifyImage[] => {
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

export const getFeaturedImage = (images: PrintifyImage[] = [], variantId?: string | null) =>
  filterImagesByVariant(images, variantId)[0] ?? null;
