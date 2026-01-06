import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { ProductActions } from '@/components/admin/product-actions';
import { PrintifySyncButton } from '@/components/admin/printify-sync-button';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Product Catalog</h1>
          <p className="text-sm text-black/60">Manage in-house products, pricing, and enablement here.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PrintifySyncButton />
          <Link
            href="/admin/products/new"
            className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-green hover:border-green/50"
          >
            New product
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="text-left text-black/60">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Variants</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const price = product.variants[0]?.priceCents ?? 0;
                return (
                  <tr key={product.id} className="border-t border-black/5">
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${product.id}`} className="font-semibold text-green hover:underline">
                        {product.title}
                      </Link>
                      <p className="text-xs text-black/50">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(price)}</td>
                    <td className="px-4 py-3 text-black/70">{product.variants.length}</td>
                    <td className="px-4 py-3 text-black/70">
                      {new Date(product.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <ProductActions productId={product.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
