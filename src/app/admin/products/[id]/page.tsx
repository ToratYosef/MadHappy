import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Image from 'next/image';

async function updateProduct(id: string, formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const priceCents = Number(formData.get('priceCents'));
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const slug = formData.get('slug') as string;
  const featured = formData.get('featured') === 'on';
  const active = formData.get('active') === 'on';

  // Handle multiple images - get all keys that start with imageUrl_
  const imageUrls: string[] = [];
  let index = 0;
  while (formData.get(`imageUrl_${index}`) !== null) {
    const url = (formData.get(`imageUrl_${index}`) as string)?.trim();
    if (url) imageUrls.push(url);
    index++;
  }

  const images = imageUrls.map((url, idx) => ({
    url,
    alt: name,
    sortOrder: idx
  }));

  if (images.length === 0) {
    throw new Error('At least one image is required');
  }

  // Delete old images and create new ones
  await prisma.productImage.deleteMany({
    where: { productId: id }
  });

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      priceCents,
      category: category as any,
      description,
      featured,
      active,
      images: {
        create: images
      }
    }
  });

  // Update inventory
  const variants = ['XS', 'S', 'M', 'L', 'XL'];
  for (const size of variants) {
    const qty = Number(formData.get(`inventory_${size}`) || 0);
    await prisma.variant.updateMany({
      where: { productId: id, size: size as any },
      data: { inventoryQty: qty }
    });
  }

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { variants: true, images: true } });
  if (!product) return notFound();

  const productId = product.id;

  async function action(formData: FormData) {
    'use server';
    await updateProduct(productId, formData);
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
            <span className="text-black/70">Slug</span>
            <input name="slug" defaultValue={product.slug} required className="w-full rounded-lg border border-black/10 px-3 py-2" />
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

        {/* Images Section */}
        <div className="space-y-3 rounded-lg border border-black/5 bg-white/50 p-4">
          <div>
            <h3 className="font-semibold text-sm">Product Images</h3>
            <p className="text-xs text-black/60">First image will be the cover. Add multiple images for a gallery.</p>
          </div>
          
          <div className="space-y-3" id="images-container">
            {product.images.map((img, index) => (
              <div key={img.id} className="space-y-2 rounded-lg border border-black/5 p-3">
                <label className="text-sm text-black/70">
                  {index === 0 ? 'Image 1 (Cover)' : `Image ${index + 1}`}
                </label>
                <input 
                  name={`imageUrl_${index}`}
                  defaultValue={img.url}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                />
                <div className="relative h-32 w-full overflow-hidden rounded-lg border border-black/5">
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
            {/* Add empty slot for new image */}
            <div className="space-y-2 rounded-lg border border-dashed border-black/20 p-3">
              <label className="text-sm text-black/70">Add new image</label>
              <input 
                name={`imageUrl_${product.images.length}`}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Inventory</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
              const variant = product.variants.find(v => v.size === size);
              return (
                <label key={size} className="space-y-1 text-sm">
                  <span className="text-black/70">{size}</span>
                  <input name={`inventory_${size}`} type="number" defaultValue={variant?.inventoryQty || 0} className="w-full rounded-lg border border-black/10 px-3 py-2" />
                </label>
              );
            })}
          </div>
        </div>

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
