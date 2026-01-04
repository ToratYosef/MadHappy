import Image from 'next/image';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function PrintifyProductDetail({ params }: Props) {
  const product = await prisma.printifyProductCache.findFirst({
    where: {
      OR: [{ id: params.id }, { printifyProductId: params.id }]
    },
    include: { variants: true }
  });

  if (!product) return notFound();

  const images = Array.isArray(product.images) ? product.images : [];
  const options = Array.isArray(product.options) ? product.options : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-black/60">Printify product</p>
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p className="text-sm text-black/60">Printify ID: {product.printifyProductId}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-black/5 bg-white p-4 shadow-soft">
            <h2 className="mb-3 text-lg font-semibold">Description</h2>
            <p className="text-black/70">{product.description}</p>
          </div>
          <div className="rounded-xl border border-black/5 bg-white p-4 shadow-soft">
            <h3 className="text-sm font-semibold text-black/70">Options</h3>
            {options.length === 0 && <p className="text-black/60">No option data stored.</p>}
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {options.map((opt: any) => (
                <div key={opt.name} className="rounded-lg border border-black/5 p-3">
                  <p className="text-sm font-semibold">{opt.name}</p>
                  <p className="text-xs text-black/60">{(opt.values || []).join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-black/5 bg-white p-4 shadow-soft">
            <h3 className="mb-3 text-lg font-semibold">Variants</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-black/60">
                  <tr>
                    <th className="px-3 py-2">Variant</th>
                    <th className="px-3 py-2">Options</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2">Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="border-t border-black/5">
                      <td className="px-3 py-2">
                        <div className="font-semibold">{variant.title}</div>
                        <div className="text-xs text-black/50">ID: {variant.variantId}</div>
                      </td>
                      <td className="px-3 py-2 text-black/70">
                        {Object.entries((variant.options as Record<string, string>) || {})
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')}
                      </td>
                      <td className="px-3 py-2">{formatCurrency(variant.priceCents)}</td>
                      <td className="px-3 py-2">{variant.isEnabled ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-black/5 bg-white p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-black/70">Images</h3>
          {images.length === 0 && <p className="text-sm text-black/60">No cached images.</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((img: any) => {
              const url = typeof img === 'string' ? img : img.url;
              const variants = Array.isArray((img as any).variantIds) ? (img as any).variantIds : [];
              if (!url) return null;
              return (
                <div
                  key={`${url}-${variants.join('-')}`}
                  className="relative aspect-square overflow-hidden rounded-lg border border-black/5"
                >
                  <Image src={url} alt={product.title} fill className="object-cover" />
                  {variants.length > 0 && (
                    <div className="absolute bottom-1 left-1 rounded bg-white/80 px-2 py-1 text-[10px] text-black/70">
                      Variants: {variants.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
