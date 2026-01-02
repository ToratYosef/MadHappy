import { prisma } from '../db';

export const getSiteSettings = () => prisma.siteSettings.findUnique({ where: { id: 'default' } });
