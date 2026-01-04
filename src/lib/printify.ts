import crypto from 'crypto';

const PRINTIFY_BASE_URL = 'https://api.printify.com/v1';

type PrintifyListResponse<T> = {
  data?: T[];
  current_page?: number;
  last_page?: number;
};

type PrintifyOrderRequest = {
  external_id: string;
  line_items: Array<{
    product_id: string;
    variant_id: number | string;
    quantity: number;
  }>;
  shipping_method?: number;
  send_shipping_notification?: boolean;
  address_to: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    country?: string | null;
    region?: string | null;
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    zip?: string | null;
  };
};

export class PrintifyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrintifyConfigError';
  }
}

export function requirePrintifyConfig() {
  const token = process.env.PRINTIFY_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;

  if (!token || !shopId) {
    throw new PrintifyConfigError('PRINTIFY_TOKEN and PRINTIFY_SHOP_ID must be configured');
  }

  return { token, shopId };
}

async function printifyRequest<T>(path: string, options: RequestInit, token: string) {
  const response = await fetch(`${PRINTIFY_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`Printify request failed (${response.status}): ${text}`);
    (error as any).status = response.status;
    throw error;
  }

  return (await response.json()) as T;
}

export async function listPrintifyProducts(shopId: string, token: string) {
  const products: any[] = [];
  let page = 1;
  // Printify caps this endpoint at 50; higher values return 400 with code 8150.
  const limit = 50;

  while (true) {
    const data = await printifyRequest<PrintifyListResponse<any>>(
      `/shops/${shopId}/products.json?page=${page}&limit=${limit}`,
      { method: 'GET' },
      token
    );

    const entries = Array.isArray(data?.data) ? data.data : Array.isArray((data as any)?.products) ? (data as any).products : [];
    if (!entries.length) break;

    products.push(...entries);

    if (data?.last_page && data.current_page && data.current_page >= data.last_page) break;
    if (!data?.last_page && entries.length < limit) break;
    page += 1;
  }

  return products;
}

export async function getPrintifyProduct(shopId: string, productId: string, token: string) {
  return printifyRequest<any>(`/shops/${shopId}/products/${productId}.json`, { method: 'GET' }, token);
}

export async function submitPrintifyOrder(shopId: string, payload: PrintifyOrderRequest, token: string) {
  return printifyRequest<any>(`/shops/${shopId}/orders.json`, { method: 'POST', body: JSON.stringify(payload) }, token);
}

export function verifyPrintifySignature(rawBody: string, signature: string | null, secret?: string) {
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected === signature;
}
