export type ProductVariant = {
  size: string;
  inventory?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  variants: ProductVariant[];
  featured?: boolean;
  category: "hoodies" | "tees" | "hats" | "accessories";
};

export const products: Product[] = [
  {
    id: "lkh-hoodie-01",
    slug: "crest-hoodie-forest",
    name: "Crest Hoodie — Forest",
    price: 16800,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80"
    ],
    description:
      "Heavyweight brushed fleece hoodie in deep forest with tonal crest embroidery and muted gold drawcord tips.",
    variants: [
      { size: "S", inventory: 10 },
      { size: "M", inventory: 16 },
      { size: "L", inventory: 12 },
      { size: "XL", inventory: 8 }
    ],
    featured: true,
    category: "hoodies"
  },
  {
    id: "lkh-hoodie-02",
    slug: "keyline-hoodie-taupe",
    name: "Keyline Hoodie — Taupe",
    price: 16200,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80"
    ],
    description:
      "Ultra-soft cotton blend hoodie in signature taupe featuring the low key high monoline key detail.",
    variants: [
      { size: "S", inventory: 9 },
      { size: "M", inventory: 15 },
      { size: "L", inventory: 14 },
      { size: "XL", inventory: 7 }
    ],
    featured: true,
    category: "hoodies"
  },
  {
    id: "lkh-tee-01",
    slug: "signal-tee-ivory",
    name: "Signal Tee — Ivory",
    price: 6800,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
    ],
    description:
      "Premium combed cotton tee with forest ink print and micro key insignia. Relaxed drop shoulder fit.",
    variants: [
      { size: "S", inventory: 22 },
      { size: "M", inventory: 28 },
      { size: "L", inventory: 24 },
      { size: "XL", inventory: 12 }
    ],
    featured: true,
    category: "tees"
  },
  {
    id: "lkh-hat-01",
    slug: "vault-6-panel",
    name: "Vault 6-Panel",
    price: 5400,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80"
    ],
    description:
      "Structured 6-panel cap in brushed canvas with gold keyline embroidery and leather strap closure.",
    variants: [{ size: "OS" }],
    category: "hats"
  },
  {
    id: "lkh-accessory-01",
    slug: "signal-keychain",
    name: "Signal Keychain",
    price: 3200,
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
    ],
    description:
      "Muted gold brass keychain with laser-cut emblem. Small reminder to keep it low, keep it high.",
    variants: [{ size: "OS" }],
    category: "accessories"
  }
];

export const findProductBySlug = (slug: string): Product | undefined =>
  products.find((product) => product.slug === slug);
