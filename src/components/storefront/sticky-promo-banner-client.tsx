'use client';

import { useEffect, useState } from 'react';
import StickyPromoBanner from './sticky-promo-banner';

export default function StickyPromoBannerClient() {
  const [banner, setBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/active-banner')
      .then(res => res.json())
      .then(data => {
        if (data.banner) {
          setBanner(data.banner);
        }
      })
      .catch(err => console.error('Failed to fetch banner:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !banner) return null;

  return <StickyPromoBanner banner={banner} />;
}
