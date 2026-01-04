import { prisma } from './db';
import { getPrintifyProduct, listPrintifyProducts } from './printify';
import { slugify } from './utils';
import type { PrintifyImage, PrintifyOption } from '@/types/printify';

type SyncSummary = {
  productsProcessed: number;
  productsCreated: number;
  productsUpdated: number;
  variantsUpserted: number;
};

function normalizeImages(images: any[]): PrintifyImage[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) => {
      if (!img) return null;
      const url =
        (typeof img === 'string' ? img : img.src || img.url || img.preview || img.preview_url) || null;
      if (!url) return null;

      const rawVariantIds = (img as any).variant_ids || (img as any).variantIds || (img as any).variants;
      const variantIds = Array.isArray(rawVariantIds)
        ? rawVariantIds.map((id: any) => String(id)).filter(Boolean)
        : undefined;

      return {
        url,
        variantIds,
        isDefault: Boolean((img as any).is_default ?? (img as any).isDefault ?? false)
      };
    })
    .filter(Boolean);
}

function normalizeOptions(options: any[]): PrintifyOption[] {
  if (!Array.isArray(options)) return [];
  return options.map((opt, idx) => ({
    name: opt?.name || opt?.type || `Option ${idx + 1}`,
    values: Array.isArray(opt?.values)
      ? opt.values.map((v: any) => v?.title || v?.name || v?.value || String(v)).filter(Boolean)
      : []
  }));
}

function buildVariantOptionMap(productOptions: PrintifyOption[], variantOptions: any[]): Record<string, string> {
  const map: Record<string, string> = {};
  if (!Array.isArray(variantOptions)) return map;

  productOptions.forEach((opt, idx) => {
    const variantValue = variantOptions[idx];
    if (variantValue === undefined || variantValue === null) return;

    let resolved: string | null = null;

    if (typeof variantValue === 'number' && opt.values[variantValue]) {
      resolved = String(opt.values[variantValue]);
    } else if (typeof variantValue === 'string') {
      resolved = variantValue;
    } else {
      const match = opt.values.find((v) => {
        if (typeof v === 'string' && typeof variantValue === 'string') {
          return v.toLowerCase() === variantValue.toLowerCase();
        }
        return v === variantValue;
      });
      resolved = match ? String(match) : String(variantValue);
    }

    if (resolved) {
      map[opt.name] = resolved;
    }
  });

  return map;
}

export async function syncPrintifyCatalog(shopId: string, token: string): Promise<SyncSummary> {
  const products = await listPrintifyProducts(shopId, token);
  let productsCreated = 0;
  let productsUpdated = 0;
  let variantsUpserted = 0;

  for (const product of products) {
    const productId = product?.id || product?.product_id;
    if (!productId) continue;

    const detail = await getPrintifyProduct(shopId, productId, token);
    const normalizedOptions = normalizeOptions(detail?.options || product?.options || []);
    const slugBase = slugify(detail?.title || product?.title || 'printify-product');
    const slug = `${slugBase}-${String(productId).slice(-6)}`;
    const productData = {
      shopId,
      printifyProductId: String(productId),
      title: detail?.title || product?.title || 'Untitled Product',
      description: detail?.description || product?.description || '',
      slug,
      images: normalizeImages(detail?.images || product?.images || []),
      options: normalizedOptions
    };

    const existing = await prisma.printifyProductCache.findUnique({
      where: { printifyProductId: String(productId) }
    });

    const record = await prisma.printifyProductCache.upsert({
      where: { printifyProductId: String(productId) },
      update: productData,
      create: productData
    });

    if (existing) productsUpdated += 1;
    else productsCreated += 1;

    await prisma.printifyVariantCache.deleteMany({ where: { productId: record.id } });

    const variants = Array.isArray(detail?.variants) ? detail.variants : [];
    if (variants.length) {
      const data = variants.map((variant: any) => ({
        productId: record.id,
        variantId: String(variant?.id ?? variant?.variant_id),
        title: variant?.title || variant?.name || 'Variant',
        options: buildVariantOptionMap(normalizedOptions, variant?.options || []),
        priceCents: Number(variant?.price ?? 0),
        isEnabled: Boolean(variant?.is_enabled ?? true),
        shippingInfo: variant?.shipping_profile || variant?.shipping
      }));

      variantsUpserted += data.length;

      await prisma.printifyVariantCache.createMany({
        data,
        skipDuplicates: true
      });
    }
  }

  return {
    productsProcessed: products.length,
    productsCreated,
    productsUpdated,
    variantsUpserted
  };
}
