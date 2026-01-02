import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Trash2 } from 'lucide-react';
import PromoCodeActions from './promo-code-actions';

async function createPromoCode(formData: FormData) {
  'use server';
  const code = (formData.get('code') as string).toUpperCase();
  const discount = Number(formData.get('discount'));
  const expiresAt = formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : null;

  await prisma.promoCode.create({
    data: { code, discount, expiresAt }
  });

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

export default async function PromoCodesPage() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  if (!hasDatabaseUrl) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Promo Codes</h1>
          <p className="text-sm text-black/60">Database is not configured. Connect a DATABASE_URL to manage promo codes.</p>
        </div>
      </div>
    );
  }

  const promoCodes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Promo Codes</h1>
        <p className="text-sm text-black/60">Manage discount codes for customers.</p>
      </div>

      {/* Create Form */}
      <form action={createPromoCode} className="rounded-xl border border-black/5 bg-white p-6 shadow-soft space-y-4">
        <h2 className="font-semibold text-lg">Create New Promo Code</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Code</span>
            <input name="code" placeholder="SUMMER20" required className="w-full rounded-lg border border-black/10 px-3 py-2 uppercase" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Discount (%)</span>
            <input name="discount" type="number" min="0" max="100" placeholder="20" required className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-black/70">Expires At (optional)</span>
            <input name="expiresAt" type="datetime-local" className="w-full rounded-lg border border-black/10 px-3 py-2" />
          </label>
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
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Expires At</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((promo) => (
                <tr key={promo.id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-semibold">{promo.code}</td>
                  <td className="px-4 py-3">{promo.discount}%</td>
                  <td className="px-4 py-3 text-black/70">
                    {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td className="px-4 py-3">
                    <PromoCodeActions promoId={promo.id} isActive={promo.active} onToggle={togglePromoCode} onDelete={deletePromoCode} />
                  </td>
                  <td className="px-4 py-3">
                    <PromoCodeActions promoId={promo.id} isActive={promo.active} onToggle={togglePromoCode} onDelete={deletePromoCode} showDeleteOnly />
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
