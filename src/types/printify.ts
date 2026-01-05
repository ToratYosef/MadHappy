export type PrintifyImagePattern = {
  spacing_x: number;
  spacing_y: number;
  angle: number;
  offset: number;
  scale?: number;
};

export type PrintifyImageLayer = {
  id: string;
  x: number;
  y: number;
  scale: number;
  angle: number;
  pattern?: PrintifyImagePattern;
  type?: string;
  name?: string;
  src?: string;
};

export type PrintifyPlaceholder = {
  position: string;
  images: PrintifyImageLayer[];
};

export type PrintifyPrintArea = {
  variant_ids: number[];
  placeholders: PrintifyPlaceholder[];
};

export type PrintifyVariant = {
  id: number;
  sku?: string | null;
  price: number;
  title?: string;
  grams?: number;
  is_enabled?: boolean;
  is_default?: boolean;
  is_available?: boolean;
  is_printify_express_eligible?: boolean;
  options?: number[];
};

export type PrintifyProduct = {
  id?: string;
  title: string;
  description: string;
  safety_information?: string;
  tags?: string[];
  options?: Array<{
    name: string;
    type?: string;
    values: Array<{
      id: number;
      title: string;
      colors?: string[];
    }>;
  }>;
  variants: PrintifyVariant[];
  images?: Array<{
    src: string;
    variant_ids?: number[];
    position?: string;
    is_default?: boolean;
  }>;
  blueprint_id: number;
  print_provider_id: number;
  print_areas: PrintifyPrintArea[];
  print_details?: {
    print_on_side?: 'regular' | 'mirror' | 'off';
  };
  external?: {
    id?: string;
    handle?: string;
    shipping_template_id?: string;
  };
  visible?: boolean;
  is_locked?: boolean;
  is_printify_express_eligible?: boolean;
  is_printify_express_enabled?: boolean;
};

export type PrintifyPublishRequest = {
  images?: boolean;
  variants?: boolean;
  title?: boolean;
  description?: boolean;
  tags?: boolean;
  shipping_template?: boolean;
  keyFeatures?: boolean;
};

export type PrintifyPublishSucceededRequest = {
  external: {
    id?: string;
    handle?: string;
    shipping_template_id?: string;
  };
};

export type PrintifyPublishFailedRequest = {
  reason: string;
};

export type PrintifyUnpublishRequest = Record<string, never>;
