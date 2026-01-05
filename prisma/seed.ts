import { PrismaClient, AdminRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmails = ['demo-admin@lowkeyhigh.test'];

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
