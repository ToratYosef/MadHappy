'use client';

import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

interface BannerActionsProps {
  bannerId: string;
  isActive: boolean;
  onToggle: (formData: FormData) => void;
  onDelete: (formData: FormData) => void;
}

export default function BannerActions({ bannerId, isActive, onToggle, onDelete }: BannerActionsProps) {
  const [togglePending, startToggleTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  const handleToggle = async () => {
    const formData = new FormData();
    formData.append('id', bannerId);
    formData.append('active', String(isActive));
    startToggleTransition(() => onToggle(formData));
  };

  const handleDelete = async () => {
    if (!confirm('Delete this banner?')) return;
    const formData = new FormData();
    formData.append('id', bannerId);
    startDeleteTransition(() => onDelete(formData));
  };

  return (
    <div className="flex items-center gap-3 mt-4">
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
      <button
        onClick={handleDelete}
        disabled={deletePending}
        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
