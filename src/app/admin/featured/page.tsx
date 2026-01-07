import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const getFeaturedIds = (settings?: { featuredProductIds?: unknown }) =>
  Array.isArray(settings?.featuredProductIds) ? settings?.featuredProductIds.map((id) => String(id)) : [];

async function updateFeatured(formData: FormData) {
  'use server';
  const selected = formData.getAll('featured') as string[];
  const orderEntries = selected.map((id) => {
    const orderValue = Number(formData.get(`order-${id}`));
    const order = Number.isFinite(orderValue) && orderValue > 0 ? orderValue : Number.MAX_SAFE_INTEGER;
    return { id, order };
  });

  orderEntries.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const featuredProductIds = orderEntries.map((entry) => entry.id);

  const existing = await prisma.siteSettings.findUnique({ where: { id: 'default' } });

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: { featuredProductIds },
    create: {
      id: 'default',
      brandName: existing?.brandName || 'LowKeyHigh',
      heroHeadline: existing?.heroHeadline || 'Understated layers built for movement.',
      heroSubheadline: existing?.heroSubheadline || 'Thoughtful fabrics, minimal forms, premium feel.',
      colors: existing?.colors || {},
      featuredProductIds
    }
  });

  revalidatePath('/');
  revalidatePath('/admin/featured');
}

export default async function FeaturedPage() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      orderBy: { title: 'asc' }
    }),
    prisma.siteSettings.findUnique({ where: { id: 'default' } })
  ]);

  const featuredIds = getFeaturedIds(settings || undefined);
  const orderMap = new Map(featuredIds.map((id, index) => [id, index + 1]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Featured products</h1>
        <p className="text-sm text-black/60">Choose which products appear on the homepage and set their order.</p>
      </div>

      <form action={updateFeatured} className="space-y-4 rounded-xl border border-black/5 bg-white p-6 shadow-soft">
        <div className="grid gap-3">
          {products.map((product) => (
            <label
              key={product.id}
              className="flex flex-col gap-2 rounded-lg border border-black/5 bg-white p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="featured"
                  value={product.id}
                  defaultChecked={orderMap.has(product.id)}
                  className="h-4 w-4"
                />
                <div>
                  <p className="font-medium">{product.title}</p>
                  {product.slug && <p className="text-xs text-black/50">/{product.slug}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-black/60">Order</span>
                <input
                  type="number"
                  name={`order-${product.id}`}
                  min={1}
                  defaultValue={orderMap.get(product.id) ?? ''}
                  className="w-20 rounded-lg border border-black/10 px-2 py-1 text-sm"
                />
              </div>
            </label>
          ))}
        </div>

        <button type="submit" className="button-primary">Save featured list</button>
      </form>
    </div>
  );
}
