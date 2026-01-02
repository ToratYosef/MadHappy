import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function updateProduct(id: string, formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const priceCents = Number(formData.get('priceCents'));
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const featured = formData.get('featured') === 'on';
  const active = formData.get('active') === 'on';

  await prisma.product.update({
    where: { id },
    data: { name, priceCents, category: category as any, description, featured, active }
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { variants: true, images: true } });
  if (!product) return notFound();

  async function action(formData: FormData) {
    'use server';
    await updateProduct(product.id, formData);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit product</h1>
        <p className="text-sm text-black/60">Update product details.</p>
      </div>
      <form action={action} className="space-y-4 rounded-xl border border-black/5 bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Name</span>
            <input name="name" defaultValue={product.name} required className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Price (cents)</span>
            <input name="priceCents" type="number" defaultValue={product.priceCents} required className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Category</span>
            <select name="category" defaultValue={product.category} className="w-full rounded-lg border border-black/10 px-3 py-2">
              <option value="HOODIE">Hoodie</option>
              <option value="TEE">Tee</option>
              <option value="HAT">Hat</option>
            </select>
          </label>
        </div>
        <label className="space-y-2 text-sm">
          <span className="text-black/70">Description</span>
          <textarea name="description" defaultValue={product.description} rows={4} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </label>
        <div className="flex flex-col gap-2 text-sm text-black/70">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" defaultChecked={product.featured} /> Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" defaultChecked={product.active} /> Active
          </label>
        </div>
        <button type="submit" className="button-primary">Save changes</button>
      </form>
    </div>
  );
}
