import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export default async function VariantsPage() {
  const variants = await prisma.printifyVariantCache.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">All Printify Variants</h1>
        <p className="text-sm text-black/60">List of cached variants across all products.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/5 bg-white shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="text-left text-black/60">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Printify Product ID</th>
              <th className="px-4 py-3">Variant ID</th>
              <th className="px-4 py-3">Variant Title</th>
              <th className="px-4 py-3">Options</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Enabled</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  {v.product ? (
                    <Link href={`/admin/products/${v.product.id}`} className="font-semibold text-green hover:underline">
                      {v.product.title}
                    </Link>
                  ) : (
                    <span className="font-medium">(orphan)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-black/70">{v.product?.printifyProductId ?? '-'}</td>
                <td className="px-4 py-3 text-black/70">{v.variantId}</td>
                <td className="px-4 py-3">{v.title}</td>
                <td className="px-4 py-3 text-black/70">
                  {Object.entries((v.options as Record<string, string>) || {})
                    .map(([k, val]) => `${k}: ${val}`)
                    .join(', ')}
                </td>
                <td className="px-4 py-3">{formatCurrency(v.priceCents)}</td>
                <td className="px-4 py-3">{v.isEnabled ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-black/70">{new Date(v.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
