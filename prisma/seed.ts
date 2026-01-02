import { PrismaClient, Category, VariantSize, AdminRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      brandName: 'low key high',
      colors: {
        background: '#f8f5ef',
        foreground: '#0f0f0f',
        taupe: '#c2b8a3',
        green: '#12312b',
        gold: '#b59645'
      },
      heroHeadline: 'Understated layers built for movement.',
      heroSubheadline: 'Thoughtful fabrics, minimal forms, premium feel. Elevate the everyday.',
      featuredProductIds: []
    }
  });

  const baseProducts = [
    {
      name: 'Silkweight Hoodie',
      slug: 'silkweight-hoodie',
      description: 'Featherlight warmth with brushed interior and tailored drape.',
      category: Category.HOODIE,
      priceCents: 16800,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?2'
      ]
    },
    {
      name: 'Heavyweight Hoodie',
      slug: 'heavyweight-hoodie',
      description: 'Structured fleece with double-lined hood and matte hardware.',
      category: Category.HOODIE,
      priceCents: 18800,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2',
        'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?2'
      ]
    },
    {
      name: 'Pima Tee',
      slug: 'pima-tee',
      description: 'Ultra-soft pima cotton with slight stretch and clean neckline.',
      category: Category.TEE,
      priceCents: 6800,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?3',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?4'
      ]
    },
    {
      name: 'Boxy Tee',
      slug: 'boxy-tee',
      description: 'Relaxed silhouette with drop shoulder and smooth handfeel.',
      category: Category.TEE,
      priceCents: 7200,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?5'
      ]
    },
    {
      name: 'Minimal Cap',
      slug: 'minimal-cap',
      description: 'Unstructured six-panel with curved brim and tonal embroidery.',
      category: Category.HAT,
      priceCents: 5400,
      featured: false,
      images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b']
    },
    {
      name: 'Performance Hat',
      slug: 'performance-hat',
      description: 'Breathable tech fabrication with quick-dry band.',
      category: Category.HAT,
      priceCents: 6200,
      featured: false,
      images: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?2']
    }
  ];

  for (const product of baseProducts) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        priceCents: product.priceCents,
        featured: product.featured,
        images: {
          create: product.images.map((url, idx) => ({ url, alt: product.name, sortOrder: idx }))
        },
        variants: {
          create: [
            { size: VariantSize.S, inventoryQty: 10, active: true },
            { size: VariantSize.M, inventoryQty: 15, active: true },
            { size: VariantSize.L, inventoryQty: 5, active: true }
          ]
        }
      }
    });

    if (product.featured) {
      await prisma.siteSettings.update({
        where: { id: 'default' },
        data: {
          featuredProductIds: {
            push: created.id
          }
        }
      });
    }
  }

  for (const email of adminEmails) {
    await prisma.adminUser.upsert({
      where: { email },
      update: {},
      create: { email, role: AdminRole.ADMIN }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
