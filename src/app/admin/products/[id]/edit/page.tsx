import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProductEditForm } from '@/components/admin/product-edit-form';

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const product = await prisma.printifyProductCache.findFirst({
    where: {
      OR: [{ id: params.id }, { printifyProductId: params.id }]
    }
  });

  if (!product) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-black/60">Edit Printify product</p>
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p className="text-sm text-black/60">Printify ID: {product.printifyProductId}</p>
      </div>

      <ProductEditForm product={{ id: product.id, title: product.title, description: product.description, slug: product.slug }} />
    </div>
  );
}
