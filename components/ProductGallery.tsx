import Image from "next/image";

type Props = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {images.map((src, index) => (
        <div key={src} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink/5">
          <Image
            src={src}
            alt={`${alt} ${index + 1}`}
            fill
            sizes="(min-width: 1024px) 320px, 50vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
