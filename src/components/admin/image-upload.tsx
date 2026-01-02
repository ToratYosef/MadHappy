'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onImagesChange?: (images: string[]) => void;
  initialImages?: string[];
}

export function ImageUpload({ onImagesChange, initialImages = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);

  const handleAddImage = () => {
    const newImages = [...images, ''];
    setImages(newImages);
    onImagesChange?.(newImages);
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
    onImagesChange?.(newImages);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange?.(newImages);
  };

  return (
    <div className="space-y-3 rounded-lg border border-black/5 bg-white/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Product Images</h3>
          <p className="text-xs text-black/60">First image will be the cover. Add multiple images for a gallery.</p>
        </div>
        <button
          type="button"
          onClick={handleAddImage}
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
        >
          <Plus className="h-4 w-4" />
          Add image
        </button>
      </div>

      <div className="space-y-3">
        {images.map((url, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-black/70">
                {index === 0 ? 'Image 1 (Cover)' : `Image ${index + 1}`}
              </label>
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              type="text"
              name={`imageUrl_${index}`}
              value={url}
              onChange={(e) => handleImageChange(index, e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
            {url && (
              <div className="relative h-32 w-full overflow-hidden rounded-lg border border-black/5">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => {}}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <p className="text-xs text-red-500">At least one image is required</p>
      )}
    </div>
  );
}
