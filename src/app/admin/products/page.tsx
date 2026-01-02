import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { PrintifySyncButton } from '@/components/admin/printify-sync-button';

export default async function ProductsPage() {
  const products = await prisma.printifyProductCache.findMany({
    include: { variants: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Printify Catalog</h1>
          <p className="text-sm text-black/60">Products are synced from Printify. Manage pricing and enablement there.</p>
        </div>
        <PrintifySyncButton />
      </div>
      <div className="overflow-x-auto rounded-xl border border-black/5 bg-white shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="text-left text-black/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Updated</th>
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
                    <p className="text-xs text-black/50">{product.printifyProductId}</p>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(price)}</td>
                  <td className="px-4 py-3 text-black/70">{product.variants.length}</td>
                  <td className="px-4 py-3 text-black/70">
                    {new Date(product.updatedAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
