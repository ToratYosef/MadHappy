import axios, { AxiosError } from 'axios';
import type {
  PrintifyProduct,
  PrintifyPublishFailedRequest,
  PrintifyPublishRequest,
  PrintifyPublishSucceededRequest,
  PrintifyUnpublishRequest
} from '@/types/printify';

const PRINTIFY_API_BASE = 'https://api.printify.com/v1';

export class PrintifyConfigError extends Error {}

type ShopScopedOptions = {
  shopId?: string;
};

const resolveShopId = (shopId?: string) => {
  const resolved = shopId || process.env.PRINTIFY_SHOP_ID;
  if (!resolved) throw new PrintifyConfigError('PRINTIFY_SHOP_ID is not configured.');
  return resolved;
};

const getAuthHeaders = () => {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) throw new PrintifyConfigError('PRINTIFY_API_TOKEN is not configured.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const getClient = () =>
  axios.create({
    baseURL: PRINTIFY_API_BASE,
    headers: getAuthHeaders()
  });

export const parsePrintifyError = (error: unknown) => {
  if (error instanceof PrintifyConfigError) {
    return { status: 500, message: error.message };
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status ?? 500;
    const details = axiosError.response?.data;
    const message =
      (typeof details === 'string' ? details : details?.message || details?.error) ||
      axiosError.message ||
      'Printify request failed';
    return { status, message, details };
  }

  const message = error instanceof Error ? error.message : 'Unknown Printify error';
  return { status: 500, message, details: error };
};

export const listPrintifyProducts = async (params: ShopScopedOptions & { limit?: number; page?: number } = {}) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.get(`/shops/${shopId}/products.json`, {
    params: { limit: params.limit, page: params.page }
  });
  return response.data;
};

export const getPrintifyProduct = async (params: ShopScopedOptions & { productId: string }) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.get(`/shops/${shopId}/products/${params.productId}.json`);
  return response.data;
};

export const getPrintifyProductGpsr = async (params: ShopScopedOptions & { productId: string }) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.get(`/shops/${shopId}/products/${params.productId}/gpsr.json`);
  return response.data;
};

export const createPrintifyProduct = async (params: ShopScopedOptions & { payload: PrintifyProduct }) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.post(`/shops/${shopId}/products.json`, params.payload);
  return response.data;
};

export const updatePrintifyProduct = async (
  params: ShopScopedOptions & { productId: string; payload: Partial<PrintifyProduct> }
) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.put(`/shops/${shopId}/products/${params.productId}.json`, params.payload);
  return response.data;
};

export const deletePrintifyProduct = async (params: ShopScopedOptions & { productId: string }) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.delete(`/shops/${shopId}/products/${params.productId}.json`);
  return response.data;
};

export const publishPrintifyProduct = async (
  params: ShopScopedOptions & { productId: string; payload: PrintifyPublishRequest }
) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.post(`/shops/${shopId}/products/${params.productId}/publish.json`, params.payload);
  return response.data;
};

export const markPrintifyPublishSucceeded = async (
  params: ShopScopedOptions & { productId: string; payload: PrintifyPublishSucceededRequest }
) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.post(
    `/shops/${shopId}/products/${params.productId}/publishing_succeeded.json`,
    params.payload
  );
  return response.data;
};

export const markPrintifyPublishFailed = async (
  params: ShopScopedOptions & { productId: string; payload: PrintifyPublishFailedRequest }
) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.post(
    `/shops/${shopId}/products/${params.productId}/publishing_failed.json`,
    params.payload
  );
  return response.data;
};

export const unpublishPrintifyProduct = async (
  params: ShopScopedOptions & { productId: string; payload?: PrintifyUnpublishRequest }
) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.post(
    `/shops/${shopId}/products/${params.productId}/unpublish.json`,
    params.payload ?? {}
  );
  return response.data;
};

// Order management functions
export const submitPrintifyOrder = async (
  params: ShopScopedOptions & {
    payload: {
      external_id: string;
      label?: string;
      line_items: Array<{
        product_id?: string;
        variant_id: number;
        quantity: number;
        sku?: string;
        external_id?: string;
      }>;
      shipping_method: number;
      send_shipping_notification?: boolean;
      address_to: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
        country: string;
        region?: string;
        address1: string;
        address2?: string;
        city: string;
        zip: string;
      };
    };
  }
) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.post(`/shops/${shopId}/orders.json`, params.payload);
  return response.data;
};

export const sendPrintifyOrderToProduction = async (
  params: ShopScopedOptions & { orderId: string }
) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.post(`/shops/${shopId}/orders/${params.orderId}/send_to_production.json`);
  return response.data;
};

export const cancelPrintifyOrder = async (
  params: ShopScopedOptions & { orderId: string }
) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.post(`/shops/${shopId}/orders/${params.orderId}/cancel.json`);
  return response.data;
};

export const getPrintifyOrder = async (
  params: ShopScopedOptions & { orderId: string }
) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.get(`/shops/${shopId}/orders/${params.orderId}.json`);
  return response.data;
};

export const listPrintifyOrders = async (
  params: ShopScopedOptions & { limit?: number; page?: number; status?: string }
) => {
  const client = getClient();
  const shopId = resolveShopId(params.shopId);
  const response = await client.get(`/shops/${shopId}/orders.json`, {
    params: { limit: params.limit, page: params.page, status: params.status }
  });
  return response.data;
};
