import type { Product, ProductImage, ProductOption, ProductVariant } from '@/types/product';
import type { PrintifyProduct, PrintifyVariant } from '@/types/printify';
import { prisma } from './db';
import { slugify } from './utils';
import { getPrintifyProduct, listPrintifyProducts, parsePrintifyError } from './printify';

type SyncResult = {
  imported: number;
  updated: number;
  requestsUsed: number;
  errors: Array<{ id?: string; message: string }>;
};

const MAX_REQUESTS = 50;
const PAGE_LIMIT = 50;

type OptionValueLookup = Record<
  string,
  {
    optionName: string;
    valueTitle: string;
  }
>;

const normalizeOptionName = (name?: string) => {
  if (!name) return 'Option';
  if (/color/i.test(name)) return 'Color';
  if (/size/i.test(name)) return 'Size';
  return name;
};

const mapOptions = (options: PrintifyProduct['options'] = []) => {
  const normalizedOptions: ProductOption[] = [];
  const valueLookup: OptionValueLookup = {};

  options.forEach((opt) => {
    if (!opt?.values?.length) return;
    const normalizedName = normalizeOptionName(opt.name);
    const values = opt.values.map((v) => v.title || String(v.id));

    normalizedOptions.push({
      name: normalizedName,
      values,
      valueIdMap: opt.values.reduce<Record<string, string>>((acc, v) => {
        acc[String(v.id)] = v.title || String(v.id);
        return acc;
      }, {})
    });

    opt.values.forEach((v) => {
      valueLookup[String(v.id)] = {
        optionName: normalizedName,
        valueTitle: v.title || String(v.id)
      };
    });
  });

  return { options: normalizedOptions, valueLookup };
};

const mapVariantOptions = (variant: PrintifyVariant, options: ProductOption[], lookup: OptionValueLookup) => {
  if (!Array.isArray(variant.options)) return {};

  return variant.options.reduce<Record<string, string>>((acc, valueId, idx) => {
    const fromLookup = lookup[String(valueId)];
    const optionName = options[idx]?.name || fromLookup?.optionName || `Option ${idx + 1}`;
    const valueTitle = fromLookup?.valueTitle || String(valueId);
    acc[optionName] = valueTitle;
    return acc;
  }, {});
};

const mapImages = (images: PrintifyProduct['images'] = []): ProductImage[] =>
  Array.isArray(images)
    ? images
        .map((img) => {
          if (!img?.src) return null;
          return {
            url: img.src,
            variantIds: Array.isArray(img.variant_ids)
              ? img.variant_ids.map((id) => String(id)).filter(Boolean)
              : undefined,
            isDefault: Boolean(img.is_default)
          };
        })
        .filter((img): img is ProductImage => Boolean(img))
    : [];

const mapVariants = (variants: PrintifyVariant[] = [], options: ProductOption[], lookup: OptionValueLookup) =>
  variants.map<ProductVariant>((variant) => ({
    id: String(variant.id),
    sku: variant.sku,
    title: variant.title || '',
    options: mapVariantOptions(variant, options, lookup),
    priceCents: variant.price,
    isEnabled: variant.is_enabled ?? true,
    shippingInfo: { grams: variant.grams }
  }));

const mapPrintifyProduct = (product: PrintifyProduct): Omit<Product, 'createdAt' | 'updatedAt'> & {
  variants: ProductVariant[];
} => {
  const { options, valueLookup } = mapOptions(product.options);
  const variants = mapVariants(product.variants, options, valueLookup);

  return {
    id: product.id || slugify(product.title),
    title: product.title,
    slug: slugify(product.title),
    description: product.description || '',
    images: mapImages(product.images),
    options,
    variants
  };
};

const extractProducts = (response: any): any[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.products)) return response.products;
  return [];
};

const hasMorePages = (page: number, pageSize: number, received: number) => received === pageSize && page < MAX_REQUESTS;

export const syncPrintifyProducts = async (shopId?: string): Promise<SyncResult> => {
  let page = 1;
  let requestsUsed = 0;
  let imported = 0;
  let updated = 0;
  const errors: SyncResult['errors'] = [];

  while (requestsUsed < MAX_REQUESTS) {
    const listResponse = await listPrintifyProducts({ shopId, limit: PAGE_LIMIT, page });
    requestsUsed += 1;

    const products = extractProducts(listResponse);
    if (!products.length) break;

    for (const product of products) {
      if (requestsUsed >= MAX_REQUESTS) break;
      let detailed = product as PrintifyProduct;

      // Ensure variants/options/images are present; fetch detail if not.
      const needsDetail =
        !Array.isArray((product as PrintifyProduct).variants) ||
        !(product as PrintifyProduct).variants?.length ||
        !(product as PrintifyProduct).options ||
        !(product as PrintifyProduct).images;

      if (needsDetail) {
        try {
          detailed = await getPrintifyProduct({ shopId, productId: product.id });
          requestsUsed += 1;
        } catch (error) {
          errors.push({ id: product?.id, message: parsePrintifyError(error).message });
          continue;
        }
      }

      try {
        const mapped = mapPrintifyProduct(detailed);
        const existing = await prisma.product.findUnique({ where: { id: mapped.id }, include: { variants: true } });

        if (existing) {
          await prisma.product.update({
            where: { id: mapped.id },
            data: {
              title: mapped.title,
              slug: mapped.slug,
              description: mapped.description,
              images: mapped.images,
              options: mapped.options,
              updatedAt: new Date()
            }
          });
          await prisma.productVariant.deleteMany({ where: { productId: mapped.id } });
          await prisma.productVariant.createMany({
            data: mapped.variants.map((variant) => ({
              ...variant,
              productId: mapped.id
            }))
          });
          updated += 1;
        } else {
          await prisma.product.create({
            data: {
              ...mapped,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            include: { variants: true }
          });
          await prisma.productVariant.deleteMany({ where: { productId: mapped.id } });
          await prisma.productVariant.createMany({
            data: mapped.variants.map((variant) => ({
              ...variant,
              productId: mapped.id
            }))
          });
          imported += 1;
        }
      } catch (error) {
        errors.push({ id: product?.id, message: parsePrintifyError(error).message });
      }
    }

    if (!hasMorePages(page, PAGE_LIMIT, products.length)) break;
    page += 1;
  }

  return { imported, updated, requestsUsed, errors };
};
