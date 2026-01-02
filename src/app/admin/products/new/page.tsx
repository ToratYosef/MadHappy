import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ImageUpload } from '@/components/admin/image-upload';

async function createProduct(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const priceCents = Number(formData.get('priceCents'));
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const slug = formData.get('slug') as string;
  const featured = formData.get('featured') === 'on';

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

  const variants = ['XS', 'S', 'M', 'L', 'XL'];

  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      category: category as any,
      priceCents,
      featured,
      images: {
        create: images
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
        <p className="text-sm text-black/60">Create a product with variants and multiple images.</p>
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
        
        {/* Images Section */}
        <ImageUploadForm />

        {/* Inventory Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Inventory</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
              <label key={size} className="space-y-1 text-sm">
                <span className="text-black/70">{size}</span>
                <input name={`inventory_${size}`} type="number" defaultValue={10} className="w-full rounded-lg border border-black/10 px-3 py-2" />
              </label>
            ))}
          </div>
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

function ImageUploadForm() {
  return (
    <div className="space-y-3 rounded-lg border border-black/5 bg-white/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Product Images</h3>
          <p className="text-xs text-black/60">First image will be the cover. Add multiple images for a gallery.</p>
        </div>
      </div>
      <div className="space-y-2" id="images-container">
        <label className="space-y-2 text-sm block">
          <span className="text-black/70">Image 1 (Cover)</span>
          <input 
            name="imageUrl_0" 
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-lg border border-black/10 px-3 py-2" 
            required
          />
        </label>
      </div>
    </div>
  );
}
