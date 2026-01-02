import { PrintifySyncButton } from '@/components/admin/printify-sync-button';

export default function NewProductPage() {
  return (
    <div className="space-y-4 rounded-xl border border-black/5 bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-semibold">Products managed in Printify</h1>
      <p className="text-black/70">
        Product creation and pricing now live in Printify. Use the sync action below to refresh the local cache.
      </p>
      <PrintifySyncButton />
    </div>
  );
}
