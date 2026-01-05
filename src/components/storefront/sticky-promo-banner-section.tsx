import { prisma } from '@/lib/db';
import StickyPromoBanner from './sticky-promo-banner';

export default async function StickyPromoBannerSection() {
  // Get the first active banner only
  const banner = await prisma.banner.findFirst({
    where: { active: true },
    include: { promoCode: true },
    orderBy: { sortOrder: 'asc' }
  });

  if (!banner || !banner.promoCode) return null;

  return (
    <StickyPromoBanner
      banner={{
        id: banner.id,
        text: banner.text || undefined,
        link: banner.link || undefined,
        promoCode: {
          code: banner.promoCode.code,
          type: banner.promoCode.type as 'PERCENTAGE' | 'FLAT_AMOUNT' | 'FREE_SHIPPING' | 'TIERED',
          discount: banner.promoCode.discount,
          flatDiscount: banner.promoCode.flatDiscount || undefined,
          minOrderAmount: banner.promoCode.minOrderAmount || undefined,
          maxDiscount: banner.promoCode.maxDiscount || undefined,
          maxUses: banner.promoCode.maxUses || undefined,
          currentUses: banner.promoCode.currentUses,
          expiresAt: banner.promoCode.expiresAt?.toISOString()
        }
      }}
    />
  );
}
