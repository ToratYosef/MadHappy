'use client';

import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

interface PromoCodeActionsProps {
  promoId: string;
  isActive: boolean;
  onToggle: (formData: FormData) => void;
  onDelete: (formData: FormData) => void;
  showDeleteOnly?: boolean;
}

export default function PromoCodeActions({ promoId, isActive, onToggle, onDelete, showDeleteOnly }: PromoCodeActionsProps) {
  const [togglePending, startToggleTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

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

  if (showDeleteOnly) {
    return (
      <button
        onClick={handleDelete}
        disabled={deletePending}
        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="h-4 w-4" />
      </button>
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
