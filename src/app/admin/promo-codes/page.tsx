import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Trash2 } from 'lucide-react';
import PromoCodeActions from './promo-code-actions';

async function createPromoCode(formData: FormData) {
  'use server';
  const code = (formData.get('code') as string).toUpperCase();
  const type = (formData.get('type') as string) || 'PERCENTAGE';
  const discount = Number(formData.get('discount')) || 0;
  const flatDiscount = formData.get('flatDiscount') ? Number(formData.get('flatDiscount')) : null;
  const maxDiscount = formData.get('maxDiscount') ? Number(formData.get('maxDiscount')) : null;
  const minOrderAmount = formData.get('minOrderAmount') ? Number(formData.get('minOrderAmount')) : null;
  const maxUses = formData.get('maxUses') ? Number(formData.get('maxUses')) : null;
  const freeShipping = formData.get('freeShipping') === 'on';
  const expiresAt = formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : null;

  const promoCode = await prisma.promoCode.create({
    data: { 
      code, 
      type: type as any,
      discount, 
      flatDiscount, 
      maxDiscount, 
      minOrderAmount, 
      maxUses, 
      freeShipping, 
      expiresAt 
    }
  });

  // Handle tiered pricing if type is TIERED
  if (type === 'TIERED') {
    const tierData = formData.get('tiers') as string;
    if (tierData) {
      try {
        const tiers = JSON.parse(tierData);
        await prisma.promoTier.createMany({
          data: tiers.map((tier: any) => ({
            promoCodeId: promoCode.id,
            minAmount: tier.minAmount,
            discount: tier.discount
          }))
        });
      } catch (e) {
        console.error('Failed to parse tiers:', e);
      }
    }
  }

  revalidatePath('/admin/promo-codes');
}

async function deletePromoCode(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath('/admin/promo-codes');
}

async function togglePromoCode(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const currentActive = formData.get('active') === 'true';
  await prisma.promoCode.update({
    where: { id },
    data: { active: !currentActive }
  });
  revalidatePath('/admin/promo-codes');
}

async function createBannerFromPromo(formData: FormData) {
  'use server';
  const promoId = formData.get('promoId') as string;
  
  const promo = await prisma.promoCode.findUnique({
    where: { id: promoId },
    include: { banners: true }
  });

  if (!promo) return;
  if (promo.banners.length > 0) return; // Already has a banner

  // Generate title and text based on promo type
  let title = promo.code;
  let text = '';

  switch (promo.type) {
    case 'PERCENTAGE':
      text = `Get ${promo.discount}% off your order`;
      break;
    case 'FLAT_AMOUNT':
      text = `Save $${((promo.flatDiscount || 0) / 100).toFixed(2)} on your order`;
      break;
    case 'FREE_SHIPPING':
      text = `Free shipping on your order`;
      break;
    case 'TIERED':
      text = `More you spend, more you save`;
      break;
  }

  if (promo.minOrderAmount && promo.type !== 'FREE_SHIPPING') {
    text += ` - Orders $${(promo.minOrderAmount / 100).toFixed(2)}+`;
  }

  // Create banner with a default placeholder image
  await prisma.banner.create({
    data: {
      title,
      text,
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
      link: '/shop',
      promoCodeId: promo.id,
      active: true,
      sortOrder: 0
    }
  });

  revalidatePath('/admin/promo-codes');
  revalidatePath('/');
}

export default async function PromoCodesPage() {
  const promoCodes = await prisma.promoCode.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { banners: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Promo Codes</h1>
        <p className="text-sm text-black/60">Manage discount codes for customers.</p>
      </div>

      {/* Create Form */}
      <form action={createPromoCode} className="rounded-xl border border-black/5 bg-white p-6 shadow-soft space-y-4">
        <h2 className="font-semibold text-lg">Create New Promo Code</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Code</span>
            <input name="code" placeholder="SUMMER20" required className="w-full rounded-lg border border-black/10 px-3 py-2 uppercase" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Type</span>
            <select name="type" className="w-full rounded-lg border border-black/10 px-3 py-2">
              <option value="PERCENTAGE">Percentage Off</option>
              <option value="FLAT_AMOUNT">Flat $ Off</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
              <option value="TIERED">Tiered ($ off based on order amount)</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Discount (%) - for percentage type</span>
            <input name="discount" type="number" min="0" max="100" placeholder="20" className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Flat Discount (cents) - for flat amount type</span>
            <input name="flatDiscount" type="number" min="0" placeholder="2000 = $20" className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Max Discount (cents)</span>
            <input name="maxDiscount" type="number" min="0" placeholder="2000 = $20" className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Min Order Amount (cents)</span>
            <input name="minOrderAmount" type="number" min="0" placeholder="5000 = $50" className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Max Uses</span>
            <input name="maxUses" type="number" min="1" placeholder="100 (optional)" className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Expires At (optional)</span>
            <input name="expiresAt" type="datetime-local" className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input name="freeShipping" type="checkbox" className="rounded border-black/10" />
          <span className="text-black/70">Include Free Shipping</span>
        </label>

        <div className="text-xs text-black/60 bg-blue-50 border border-blue-200 rounded p-3">
          <strong>Note:</strong> For TIERED promo codes, you&apos;ll need to add tiers after creation using the database or a future admin interface.
        </div>

        <button type="submit" className="button-primary">Create Promo Code</button>
      </form>

      {/* Promo Codes List */}
      {promoCodes.length === 0 ? (
        <div className="rounded-xl border border-black/5 bg-white p-6 text-center text-black/60">
          No promo codes yet. Create one to get started.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/5 bg-white shadow-soft">
          <table className="min-w-full text-sm">
            <thead className="text-left text-black/60 border-b border-black/5">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min Order</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Expires At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((promo) => (
                <tr key={promo.id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-semibold">{promo.code}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {promo.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {promo.type === 'PERCENTAGE' && `${promo.discount}%`}
                    {promo.type === 'FLAT_AMOUNT' && `$${((promo.flatDiscount || 0) / 100).toFixed(2)}`}
                    {promo.type === 'FREE_SHIPPING' && 'Free Ship'}
                    {promo.type === 'TIERED' && 'Tiered'}
                    {promo.maxDiscount && ` (max $${(promo.maxDiscount / 100).toFixed(2)})`}
                  </td>
                  <td className="px-4 py-3 text-black/70">
                    {promo.minOrderAmount ? `$${(promo.minOrderAmount / 100).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-black/70">{promo.currentUses}{promo.maxUses ? ` / ${promo.maxUses}` : ''}</td>
                  <td className="px-4 py-3 text-black/70">
                    {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td className="px-4 py-3">
                    <PromoCodeActions promoId={promo.id} isActive={promo.active} onToggle={togglePromoCode} onDelete={deletePromoCode} promo={promo} />
                  </td>
                  <td className="px-4 py-3">
                    <PromoCodeActions promoId={promo.id} isActive={promo.active} onToggle={togglePromoCode} onDelete={deletePromoCode} onCreateBanner={createBannerFromPromo} promo={promo} showDeleteOnly />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
