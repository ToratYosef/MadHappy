import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function updateSettings(formData: FormData) {
  'use server';
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      brandName: (formData.get('brandName') as string) || 'low key high',
      heroHeadline: (formData.get('heroHeadline') as string) || '',
      heroSubheadline: (formData.get('heroSubheadline') as string) || '',
      colors: JSON.parse((formData.get('colors') as string) || '{}')
    },
    create: {
      id: 'default',
      brandName: 'low key high',
      heroHeadline: 'Understated layers built for movement.',
      heroSubheadline: 'Thoughtful fabrics, minimal forms, premium feel.',
      colors: {},
      featuredProductIds: []
    }
  });
  revalidatePath('/');
}

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
  async function action(formData: FormData) {
    'use server';
    await updateSettings(formData);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-black/60">Update storefront messaging and theme.</p>
      </div>
      <form action={action} className="space-y-4 rounded-xl border border-black/5 bg-white p-6 shadow-soft">
        <label className="space-y-2 text-sm">
          <span className="text-black/70">Brand name</span>
          <input name="brandName" defaultValue={settings?.brandName} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-black/70">Hero headline</span>
          <input name="heroHeadline" defaultValue={settings?.heroHeadline} className="w-full rounded-lg border border-black/10 px-3 py-2" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-black/70">Hero subheadline</span>
          <textarea
            name="heroSubheadline"
            defaultValue={settings?.heroSubheadline ?? ''}
            rows={3}
            className="w-full rounded-lg border border-black/10 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-black/70">Colors JSON</span>
          <textarea
            name="colors"
            defaultValue={JSON.stringify(settings?.colors ?? {}, null, 2)}
            rows={4}
            className="w-full rounded-lg border border-black/10 px-3 py-2 font-mono text-xs"
          />
        </label>
        <button type="submit" className="button-primary">Save settings</button>
      </form>
    </div>
  );
}
