"use client";

import { useEffect, useState } from "react";

export default function ImageMappingsAdmin() {
  const [store, setStore] = useState<Record<string, Record<string, string>>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  // selectedImages holds image urls for selection
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/admin/image-mappings")
      .then((r) => r.json())
      .then(setStore)
      .catch(() => setStore({}));

    fetch("/api/admin/printify-products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      setMappings({});
      setSelectedImages(new Set());
      setLastSelectedIndex(null);
      return;
    }
    const pid = selectedProduct.printifyProductId;
    setMappings(store[pid] || {});
    setSelectedImages(new Set());
    setLastSelectedIndex(null);
  }, [selectedProduct, store]);

  const isMeta = (e: React.MouseEvent) => e.metaKey || e.ctrlKey;

  const getDisplayedImages = () => {
    const imgs: string[] = selectedProduct?.images || [];
    // images without a mapping first, then mapped ones go to bottom
    const unmapped = imgs.filter((i) => !mappings[i]);
    const mapped = imgs.filter((i) => mappings[i]);
    return [...unmapped, ...mapped];
  };

  const handleImageClick = (idx: number, e: React.MouseEvent) => {
    const imgs = getDisplayedImages();
    const img = imgs[idx];
    if (!img) return;

    if (e.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, idx);
      const end = Math.max(lastSelectedIndex, idx);
      const next = new Set(selectedImages);
      for (let i = start; i <= end; i++) next.add(imgs[i]);
      setSelectedImages(next);
    } else if (isMeta(e)) {
      const next = new Set(selectedImages);
      if (next.has(img)) next.delete(img);
      else next.add(img);
      setSelectedImages(next);
      setLastSelectedIndex(idx);
    } else {
      // single selection
      const next = new Set<string>();
      next.add(img);
      setSelectedImages(next);
      setLastSelectedIndex(idx);
    }
  };

  const assignColorToSelected = (color: string) => {
    const next = { ...mappings };
    selectedImages.forEach((img) => {
      next[img] = color;
    });
    setMappings(next);
  };

  const save = async () => {
    if (!selectedProduct) return;
    setStatus("saving");
    const res = await fetch("/api/admin/image-mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: selectedProduct.printifyProductId, mappings })
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("saved");
      setStore((s) => ({ ...s, [selectedProduct.printifyProductId]: mappings }));
    } else {
      setStatus("error: " + (data.error || "unknown"));
    }
    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Image → Color mappings</h1>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-medium mb-2">Products</h2>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {products.map((p) => (
              <button
                key={p.printifyProductId}
                onClick={() => setSelectedProduct(p)}
                className={`w-full text-left rounded border px-3 py-2 ${selectedProduct?.printifyProductId === p.printifyProductId ? 'border-green' : ''}`}>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-black/60">{p.printifyProductId}</div>
              </button>
            ))}
            {products.length === 0 && <div className="text-sm text-black/60">No products found.</div>}
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-sm text-black/60">Selected product:</div>
            <div className="font-medium">{selectedProduct?.title || '—'}</div>
            <div className="text-sm text-black/50">{selectedProduct?.printifyProductId}</div>
          </div>

          <div className="mb-3 flex items-center gap-3">
            <select id="assign-color-input" className="rounded border px-2 py-1">
              <option value="">-- choose color --</option>
              {(() => {
                const colorOpt = (selectedProduct?.options || []).find((o: any) => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colors');
                return (colorOpt?.values || []).map((v: string) => <option key={v} value={v}>{v}</option>);
              })()}
            </select>
            <button onClick={() => { const el = document.getElementById('assign-color-input') as HTMLSelectElement; assignColorToSelected(el?.value || ''); }} className="rounded bg-green px-3 py-2 text-white">Assign color to selected</button>
            <button onClick={save} className="ml-3 rounded bg-black/5 px-3 py-2">Save mappings</button>
            <span className="ml-3 text-sm text-black/60">{status}</span>
          </div>

          <div className="grid grid-cols-6 gap-3">
            {getDisplayedImages().map((img: string, idx: number) => (
              <div key={img} className={`border rounded p-1 cursor-pointer ${selectedImages.has(img) ? 'ring-2 ring-green' : ''}`} onClick={(e) => handleImageClick(idx, e as any)}>
                <div className="relative h-24 w-full overflow-hidden">
                  <img src={img} alt="thumb" className="h-full w-full object-cover" />
                  {mappings[img] && (
                    <span className="absolute right-2 top-2 rounded-full bg-green px-2 py-1 text-xs font-semibold text-white">Mapped</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <select value={mappings[img] || ''} onChange={(e) => setMappings((s) => ({ ...s, [img]: e.target.value }))} className="rounded border px-2 py-1 text-sm w-full">
                    <option value="">-- choose color --</option>
                    {(() => {
                      const colorOpt = (selectedProduct?.options || []).find((o: any) => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colors');
                      return (colorOpt?.values || []).map((v: string) => <option key={v} value={v}>{v}</option>);
                    })()}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
