import { prisma } from '@/lib/db';
import PromoBanner from './promo-banner';

export default async function PromoBannerSection() {
  const banners = await prisma.banner.findMany({
    where: { active: true },
    include: { promoCode: true },
    orderBy: { sortOrder: 'asc' }
  });

  if (banners.length === 0) return null;

  return (
    <section className="py-6 md:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {banners.map((banner) => (
            <PromoBanner
              key={banner.id}
              banner={{
                ...banner,
                text: banner.text || undefined,
                link: banner.link || undefined,
                promoCode: banner.promoCode ? {
                  ...banner.promoCode,
                  id: banner.promoCode.id,
                  code: banner.promoCode.code,
                  type: banner.promoCode.type as 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_SHIPPING' | 'TIERED',
                  discount: banner.promoCode.discount,
                  flatDiscount: banner.promoCode.flatDiscount || undefined,
                  minOrderAmount: banner.promoCode.minOrderAmount || undefined,
                  freeShipping: banner.promoCode.freeShipping,
                  maxDiscount: banner.promoCode.maxDiscount || undefined,
                  maxUses: banner.promoCode.maxUses || undefined,
                  currentUses: banner.promoCode.currentUses,
                  expiresAt: banner.promoCode.expiresAt?.toISOString()
                } : undefined
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
