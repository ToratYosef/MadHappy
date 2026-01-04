export type ProductOption = {
  name: string;
  values: string[];
  valueIdMap?: Record<string, string>;
};

export type ProductVariant = {
  id: string;
  sku?: string | null;
  title: string;
  options: Record<string, string>;
  priceCents: number;
  isEnabled: boolean;
  shippingInfo?: Record<string, unknown> | null;
};

export type ProductImage = {
  url: string;
  variantIds?: string[];
  isDefault?: boolean;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
};
