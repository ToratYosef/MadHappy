export type PrintifyOption = {
  name: string;
  values: string[];
};

export type PrintifyVariant = {
  id: string;
  variantId: string;
  title: string;
  options: Record<string, string>;
  priceCents: number;
  isEnabled: boolean;
  shippingInfo?: Record<string, unknown> | null;
};

export type PrintifyProduct = {
  id: string;
  shopId: string;
  printifyProductId: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  options: PrintifyOption[];
  variants: PrintifyVariant[];
  updatedAt: Date;
};

export type PrintifyWebhookPayload = {
  type: string;
  data: Record<string, any>;
};
