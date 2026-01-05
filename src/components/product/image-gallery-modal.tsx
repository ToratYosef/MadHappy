'use client';

import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ProductImage } from '@/types/product';

interface Props {
  images: ProductImage[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageGalleryModal({ images, initialIndex, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTranslate, setLastTranslate] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [didDrag, setDidDrag] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scale = 2.4;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewport({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
  }, [currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));

  const maxOffsets = () => {
    const maxX = ((scale - 1) / scale) * (viewport.width / 2);
    const maxY = ((scale - 1) / scale) * (viewport.height / 2);
    return { maxX, maxY };
  };

  const handleZoomToggle = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    if (isZoomed) {
      setIsZoomed(false);
      setTranslate({ x: 0, y: 0 });
      setLastTranslate({ x: 0, y: 0 });
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tx = centerX / scale - x;
    const ty = centerY / scale - y;
    const { maxX, maxY } = maxOffsets();
    const clampedX = clamp(tx, maxX);
    const clampedY = clamp(ty, maxY);

    setTranslate({ x: clampedX, y: clampedY });
    setLastTranslate({ x: clampedX, y: clampedY });
    setIsZoomed(true);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isZoomed || !containerRef.current) return;
    const point = { x: e.clientX, y: e.clientY };
    setDragStart(point);
    setDidDrag(false);
    setDragging(true);
    containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // For touch/pen: drag to pan when zoomed
    if (dragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setDidDrag(true);
      const { maxX, maxY } = maxOffsets();
      const nextX = clamp(lastTranslate.x + dx, maxX);
      const nextY = clamp(lastTranslate.y + dy, maxY);
      setTranslate({ x: nextX, y: nextY });
      return;
    }

    // For mouse: hover-move to pan when zoomed (no click-drag needed)
    if (isZoomed && e.pointerType === 'mouse' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tx = centerX / scale - x;
      const ty = centerY / scale - y;
      const { maxX, maxY } = maxOffsets();
      const clampedX = clamp(tx, maxX);
      const clampedY = clamp(ty, maxY);
      setTranslate({ x: clampedX, y: clampedY });
      setLastTranslate({ x: clampedX, y: clampedY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
    setLastTranslate(translate);
  };

  const handleClickZoom = (e: React.MouseEvent) => {
    if (didDrag) {
      setDidDrag(false);
      return;
    }
    handleZoomToggle(e.clientX, e.clientY);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={goToPrevious}
          className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Main image */}
      <div
        ref={containerRef}
        className="relative h-[80vh] w-[90vw] max-w-5xl pb-28 flex items-center justify-center touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClickZoom}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-xl bg-black/50"
          style={{ cursor: isZoomed ? 'grab' : 'zoom-in' }}
        >
          <Image
            src={images[currentIndex].url}
            alt="Product image"
            fill
            className="object-contain select-none"
            sizes="90vw"
            priority
            style={{
              transform: isZoomed
                ? `translate(${translate.x}px, ${translate.y}px) scale(${scale})`
                : 'translate(0px, 0px) scale(1)',
              transition: dragging ? 'none' : 'transform 160ms ease-out'
            }}
          />
        </div>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto rounded-lg bg-white/10 p-2 backdrop-blur">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md transition ${
                idx === currentIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
