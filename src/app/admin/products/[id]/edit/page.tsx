import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ProductEditForm } from '@/components/admin/product-edit-form';

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const product = await prisma.product.findFirst({
    where: { id: params.id },
    include: { variants: true }
  });

  if (!product) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-black/60">Edit product</p>
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p className="text-sm text-black/60">Slug: {product.slug}</p>
      </div>

      <ProductEditForm
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          slug: product.slug,
          options: product.options as any,
          variants: product.variants as any
        }}
      />
    </div>
  );
}
