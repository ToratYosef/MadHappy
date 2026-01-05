'use client';

import { Trash2, ImagePlus } from 'lucide-react';
import { useTransition } from 'react';

interface PromoCodeActionsProps {
  promoId: string;
  isActive: boolean;
  onToggle: (formData: FormData) => void;
  onDelete: (formData: FormData) => void;
  onCreateBanner?: (formData: FormData) => void;
  showDeleteOnly?: boolean;
  promo?: any;
}

export default function PromoCodeActions({ promoId, isActive, onToggle, onDelete, onCreateBanner, showDeleteOnly, promo }: PromoCodeActionsProps) {
  const [togglePending, startToggleTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [bannerPending, startBannerTransition] = useTransition();

  const handleToggle = async () => {
    const formData = new FormData();
    formData.append('id', promoId);
    formData.append('active', String(isActive));
    startToggleTransition(() => onToggle(formData));
  };

  const handleDelete = async () => {
    if (!confirm('Delete this promo code?')) return;
    const formData = new FormData();
    formData.append('id', promoId);
    startDeleteTransition(() => onDelete(formData));
  };

  const handleCreateBanner = async () => {
    if (!promo || !onCreateBanner) return;
    if (promo.banners && promo.banners.length > 0) {
      alert('This promo code already has a banner');
      return;
    }
    const formData = new FormData();
    formData.append('promoId', promoId);
    startBannerTransition(() => onCreateBanner(formData));
  };

  if (showDeleteOnly) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={deletePending}
          className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete promo code"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        {promo && (!promo.banners || promo.banners.length === 0) && (
          <button
            onClick={handleCreateBanner}
            disabled={bannerPending}
            className="text-green hover:text-green/80 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Create banner from promo code"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={togglePending}
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        isActive 
          ? 'bg-green/20 text-green' 
          : 'bg-black/10 text-black/60'
      } ${togglePending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </button>
  );
}
