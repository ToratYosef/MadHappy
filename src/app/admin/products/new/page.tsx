import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

async function createProduct(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const priceCents = Number(formData.get('priceCents'));
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const slug = formData.get('slug') as string;
  const featured = formData.get('featured') === 'on';

  const variants = ['S', 'M', 'L', 'XL'];

  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      category: category as any,
      priceCents,
      featured,
      images: {
        create: [{ url: formData.get('image') as string, alt: name, sortOrder: 0 }]
      },
      variants: {
        create: variants.map((size) => ({ size: size as any, inventoryQty: Number(formData.get(`inventory_${size}`) || 0) }))
      }
    }
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export default function NewProductPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New product</h1>
        <p className="text-sm text-black/60">Create a product with variants and imagery.</p>
      </div>
      <form action={createProduct} className="space-y-4 rounded-xl border border-black/5 bg-white p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Name</span>
            <input name="name" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Slug</span>
            <input name="slug" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Price (cents)</span>
            <input name="priceCents" type="number" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Category</span>
            <select name="category" className="w-full rounded-lg border border-black/10 px-3 py-2">
              <option value="HOODIE">Hoodie</option>
              <option value="TEE">Tee</option>
              <option value="HAT">Hat</option>
            </select>
          </label>
        </div>
        <label className="space-y-2 text-sm">
          <span className="text-black/70">Description</span>
          <textarea name="description" rows={4} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-black/70">Image URL</span>
          <input name="image" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {['S', 'M', 'L', 'XL'].map((size) => (
            <label key={size} className="space-y-1 text-sm">
              <span className="text-black/70">Inventory {size}</span>
              <input name={`inventory_${size}`} type="number" defaultValue={10} className="w-full rounded-lg border border-black/10 px-3 py-2" />
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-black/70">
          <input type="checkbox" name="featured" className="rounded border-black/20" />
          Mark as featured
        </label>
        <button type="submit" className="button-primary">Create product</button>
      </form>
    </div>
  );
}
