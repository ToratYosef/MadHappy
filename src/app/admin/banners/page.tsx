import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import BannerActions from './banner-actions';

async function createBanner(formData: FormData) {
  'use server';
  const title = formData.get('title') as string;
  const text = formData.get('text') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const link = formData.get('link') as string;
  const promoCodeId = formData.get('promoCodeId') as string;

  await prisma.banner.create({
    data: { title, text, imageUrl, link: link || null, promoCodeId: promoCodeId || null }
  });

  revalidatePath('/admin/banners');
}

async function deleteBanner(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  await prisma.banner.delete({ where: { id } });
  revalidatePath('/admin/banners');
}

async function toggleBanner(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const currentActive = formData.get('active') === 'true';
  await prisma.banner.update({
    where: { id },
    data: { active: !currentActive }
  });
  revalidatePath('/admin/banners');
}

export default async function BannersPage(props: { searchParams: Promise<{ promoCodeId?: string; code?: string; discount?: string }> }) {
  const searchParams = await props.searchParams;
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' }, include: { promoCode: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Banners</h1>
        <p className="text-sm text-black/60">Manage promotional banners.</p>
      </div>

      {/* Create Form */}
      <form action={createBanner} className="rounded-xl border border-black/5 bg-white p-6 shadow-soft space-y-4">
        <h2 className="font-semibold text-lg">Create New Banner</h2>
        {searchParams.promoCodeId && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-900">Creating banner for promo code: <strong>{searchParams.code}</strong> ({searchParams.discount}% off)</p>
            <input type="hidden" name="promoCodeId" value={searchParams.promoCodeId} />
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Title</span>
            <input name="title" placeholder={searchParams.code ? `${searchParams.code} Sale` : "Summer Sale"} required className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Link (optional)</span>
            <input name="link" placeholder="/shop" className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
        </div>
        <label className="space-y-2 text-sm">
          <span className="text-black/70">Text</span>
          <textarea name="text" placeholder={searchParams.discount ? `Get ${searchParams.discount}% off` : "Get up to 50% off"} rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-black/70">Image URL</span>
          <input name="imageUrl" placeholder="https://example.com/banner.jpg" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </label>
        <button type="submit" className="button-primary">Create Banner</button>
      </form>

      {/* Banners List */}
      {banners.length === 0 ? (
        <div className="rounded-xl border border-black/5 bg-white p-6 text-center text-black/60">
          No banners yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div key={banner.id} className="rounded-xl border border-black/5 bg-white overflow-hidden shadow-soft">
              <div className="grid gap-6 md:grid-cols-[1fr_2fr] p-4">
                {/* Image */}
                <div className="relative h-40 overflow-hidden rounded-lg border border-black/5">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{banner.title}</h3>
                      {banner.promoCode && (
                        <span className="inline-block bg-green/20 text-green text-xs px-2 py-1 rounded-full">
                          {banner.promoCode.code}
                        </span>
                      )}
                    </div>
                    {banner.text && <p className="text-sm text-black/70 mt-2">{banner.text}</p>}
                    {banner.link && <p className="text-xs text-black/50 mt-2">Link: {banner.link}</p>}
                    {banner.promoCode && (
                      <p className="text-xs text-black/50 mt-2">Promo: {banner.promoCode.discount}% off {banner.promoCode.maxDiscount ? `(up to $${banner.promoCode.maxDiscount})` : ''} {banner.promoCode.expiresAt ? `- Expires: ${new Date(banner.promoCode.expiresAt).toLocaleDateString()}` : ''}</p>
                    )}
                  </div>

                  <BannerActions bannerId={banner.id} isActive={banner.active} onToggle={toggleBanner} onDelete={deleteBanner} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
