import { prisma } from '../db';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export const getSiteSettings = () =>
  hasDatabaseUrl ? prisma.siteSettings.findUnique({ where: { id: 'default' } }) : Promise.resolve(null);
