import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ include: { variants: true }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-black/60">Manage catalog and inventory.</p>
        </div>
        <Link href="/admin/products/new" className="button-primary">
          New product
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-black/5 bg-white shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="text-left text-black/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Inventory</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="font-semibold text-green hover:underline">
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{formatCurrency(product.priceCents)}</td>
                <td className="px-4 py-3 text-black/70">{product.active ? 'Active' : 'Hidden'}</td>
                <td className="px-4 py-3 text-black/70">
                  {product.variants.reduce((acc, v) => acc + v.inventoryQty, 0)} in stock
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
