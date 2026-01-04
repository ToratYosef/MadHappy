import type { PrintifyImage } from '@/types/printify';

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
  variantId?: string | null
): PrintifyImage[] => {
  if (!Array.isArray(images)) return [];

  const normalizedVariantId = variantId ? String(variantId) : null;
  const matching = normalizedVariantId
    ? images.filter((img) => getVariantIds(img).includes(normalizedVariantId))
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
