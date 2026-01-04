import { randomUUID } from 'crypto';
import { Timestamp, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db as firestore } from './firebase';

type WhereFilter = Record<string, any>;

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  if (value?.toDate) return value.toDate();
  return null;
};

const applyWhere = (record: any, where?: WhereFilter) => {
  if (!where) return true;

  const entries = Object.entries(where);
  for (const [key, condition] of entries) {
    if (key === 'OR' && Array.isArray(condition)) {
      if (!condition.some((inner) => applyWhere(record, inner))) return false;
      continue;
    }
    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      const value = record[key];
      if ('gte' in condition && value && toDate(value)! < toDate(condition.gte)!) return false;
      if ('lte' in condition && value && toDate(value)! > toDate(condition.lte)!) return false;
      if ('contains' in condition && typeof value === 'string') {
        const target = String(condition.contains);
        const insensitive = condition.mode === 'insensitive';
        const lhs = insensitive ? value.toLowerCase() : value;
        const rhs = insensitive ? target.toLowerCase() : target;
        if (!lhs.includes(rhs)) return false;
      }
      if ('notIn' in condition && Array.isArray(condition.notIn)) {
        if (condition.notIn.includes(value)) return false;
      }
      if ('in' in condition && Array.isArray(condition.in)) {
        if (!condition.in.includes(value)) return false;
      }
      continue;
    }

    if (record[key] !== condition) return false;
  }
  return true;
};

const sortRecords = (records: any[], order: any) => {
  if (!order) return records;
  const [[key, direction]] = Object.entries(order);
  const dir = (direction as string)?.toLowerCase?.() === 'desc' ? -1 : 1;
  return [...records].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal === bVal) return 0;
    return aVal > bVal ? dir : -dir;
  });
};

const normalizeRecord = (raw: any) => {
  if (!raw || typeof raw !== 'object') return raw;
  const copy: Record<string, any> = { ...raw };
  ['createdAt', 'updatedAt'].forEach((key) => {
    if (copy[key]) {
      const dateValue = toDate(copy[key]);
      if (dateValue) copy[key] = dateValue;
    }
  });
  return copy;
};

const collectionData = async <T>(name: string) => {
  const snapshot = await getDocs(collection(firestore, name));
  return snapshot.docs.map((d) => ({ id: d.id, ...normalizeRecord(d.data()) })) as T[];
};

const singleDoc = async <T>(name: string, id: string) => {
  const snapshot = await getDoc(doc(firestore, name, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...normalizeRecord(snapshot.data()) } as T;
};

const upsertDoc = async (name: string, id: string, data: Record<string, any>) => {
  const now = new Date();
  const ref = doc(firestore, name, id);
  const existing = await getDoc(ref);
  const existingData = existing.exists() ? existing.data() : {};
  await setDoc(
    ref,
    {
      ...data,
      createdAt: data.createdAt ?? existingData?.createdAt ?? now,
      updatedAt: now
    },
    { merge: true }
  );
};

const removeDoc = async (name: string, id: string) => deleteDoc(doc(firestore, name, id));

const PrismaLike = {
  order: {
    aggregate: async ({ _sum, where }: any) => {
      const orders = (await collectionData<any>('orders')).filter((o) => applyWhere(o, where));
      const total = _sum?.totalCents
        ? orders.reduce((acc, order) => acc + Number(order.totalCents || 0), 0)
        : 0;
      return { _sum: { totalCents: total } };
    },
    count: async ({ where }: any) => (await collectionData<any>('orders')).filter((o) => applyWhere(o, where)).length,
    findMany: async (args: any = {}) => {
      const { where, orderBy: orderRule, skip = 0, take, include } = args;
      let orders = (await collectionData<any>('orders')).filter((o) => applyWhere(o, where));
      orders = orderRule ? sortRecords(orders, orderRule) : orders;
      const sliced = take ? orders.slice(skip, skip + take) : orders.slice(skip);
      return include?.items ? sliced : sliced.map((o) => ({ ...o, items: o.items ?? [] }));
    },
    findUnique: async ({ where, include }: any) => {
      const id = where?.id;
      if (!id) return null;
      const order = await singleDoc<any>('orders', id);
      if (!order) return null;
      return include?.items ? order : { ...order, items: order.items ?? [] };
    },
    findFirst: async ({ where, include }: any) => {
      const orders = (await collectionData<any>('orders')).filter((o) => applyWhere(o, where));
      const first = orders[0];
      if (!first) return null;
      return include?.items ? first : { ...first, items: first.items ?? [] };
    },
    groupBy: async ({ by }: any) => {
      const orders = await collectionData<any>('orders');
      if (by.includes('customerEmail')) {
        const map: Record<string, number> = {};
        orders.forEach((order) => {
          const email = order.customerEmail;
          if (email) map[email] = (map[email] || 0) + 1;
        });
        return Object.entries(map).map(([customerEmail, count]) => ({
          customerEmail,
          _count: { _all: count }
        }));
      }
      return [];
    },
    create: async ({ data }: any) => {
      const id = data.id || randomUUID();
      await upsertDoc('orders', id, { ...data, items: data.items?.createMany?.data ?? data.items ?? [] });
      return { ...(await singleDoc<any>('orders', id))!, id };
    },
    update: async ({ where, data, include }: any) => {
      const id = where?.id;
      if (!id) throw new Error('Order id required');
      await updateDoc(doc(firestore, 'orders', id), { ...data, updatedAt: new Date() });
      const order = await singleDoc<any>('orders', id);
      return include?.items ? order : { ...order, items: order?.items ?? [] };
    },
    updateMany: async ({ where, data }: any) => {
      const orders = (await collectionData<any>('orders')).filter((o) => applyWhere(o, where));
      await Promise.all(
        orders.map((order) => updateDoc(doc(firestore, 'orders', order.id), { ...data, updatedAt: new Date() }))
      );
      return { count: orders.length };
    }
  },
  printifyProductCache: {
    findUnique: async ({ where, include }: any = {}) => {
      if (where?.id) return PrismaLike.printifyProductCache.findFirst({ where: { id: where.id }, include });
      if (where?.printifyProductId)
        return PrismaLike.printifyProductCache.findFirst({
          where: { printifyProductId: where.printifyProductId },
          include
        });
      return null;
    },
    findMany: async ({ where, include, orderBy, take }: any = {}) => {
      let products = (await collectionData<any>('printifyProducts')).filter((p) => applyWhere(p, where));
      products = orderBy ? sortRecords(products, orderBy) : products;
      if (take) products = products.slice(0, take);

      if (include?.variants) {
        const variants = await collectionData<any>('printifyVariantCache');
        return products.map((product) => ({
          ...product,
          variants: sortRecords(
            variants
              .filter((v) => v.productId === product.id)
              .filter((v) => applyWhere(v, include?.variants?.where)),
            include?.variants?.orderBy
          )
        }));
      }

      return products;
    },
    findFirst: async ({ where, include }: any = {}) => {
      const products = await PrismaLike.printifyProductCache.findMany({ where, include });
      return products[0] || null;
    },
    upsert: async ({ where, create, update }: any) => {
      const id = where?.id || where?.printifyProductId || randomUUID();
      await upsertDoc('printifyProducts', id, { ...create, ...update, id });
      return PrismaLike.printifyProductCache.findFirst({ where: { id }, include: { variants: true } });
    },
    update: async ({ where, data }: any) => {
      const id = where?.id;
      if (!id) throw new Error('Product id required');
      await upsertDoc('printifyProducts', id, data);
      return await PrismaLike.printifyProductCache.findFirst({ where: { id }, include: { variants: true } });
    },
    delete: async ({ where }: any) => {
      const id = where?.id;
      if (!id) return;
      await removeDoc('printifyProducts', id);
      const variants = await PrismaLike.printifyVariantCache.findMany({ where: { productId: id } });
      await Promise.all(variants.map((variant: any) => removeDoc('printifyVariantCache', variant.id)));
    }
  },
  printifyVariantCache: {
    findMany: async ({ where, include }: any = {}) => {
      const variants = (await collectionData<any>('printifyVariantCache')).filter((v) => applyWhere(v, where));
      if (include?.product) {
        const products = await collectionData<any>('printifyProducts');
        return variants.map((variant) => ({
          ...variant,
          product: products.find((p) => p.id === variant.productId)
        }));
      }
      return variants;
    },
    deleteMany: async ({ where }: any = {}) => {
      const variants = (await collectionData<any>('printifyVariantCache')).filter((v) => applyWhere(v, where));
      await Promise.all(variants.map((variant) => removeDoc('printifyVariantCache', variant.id)));
      return { count: variants.length };
    },
    createMany: async ({ data }: any) => {
      const now = new Date();
      await Promise.all(
        data.map((variant: any) => {
          const id = variant.id || randomUUID();
          return upsertDoc('printifyVariantCache', id, { ...variant, createdAt: now });
        })
      );
      return { count: data.length };
    },
    count: async ({ where }: any = {}) => (await PrismaLike.printifyVariantCache.findMany({ where })).length
  },
  banner: {
    create: async ({ data }: any) => {
      const id = data.id || randomUUID();
      await upsertDoc('banners', id, data);
      return singleDoc<any>('banners', id);
    },
    delete: async ({ where }: any) => removeDoc('banners', where?.id),
    update: async ({ where, data }: any) => {
      await updateDoc(doc(firestore, 'banners', where?.id), { ...data, updatedAt: new Date() });
      return singleDoc<any>('banners', where?.id);
    },
    findMany: async ({ orderBy: orderRule }: any = {}) => {
      let banners = await collectionData<any>('banners');
      banners = orderRule ? sortRecords(banners, orderRule) : banners;
      return banners;
    }
  },
  promoCode: {
    create: async ({ data }: any) => {
      const id = data.id || randomUUID();
      await upsertDoc('promoCodes', id, data);
      return singleDoc<any>('promoCodes', id);
    },
    delete: async ({ where }: any) => removeDoc('promoCodes', where?.id),
    update: async ({ where, data }: any) => {
      await updateDoc(doc(firestore, 'promoCodes', where?.id), { ...data, updatedAt: new Date() });
      return singleDoc<any>('promoCodes', where?.id);
    },
    findMany: async ({ orderBy: orderRule }: any = {}) => {
      let promos = await collectionData<any>('promoCodes');
      promos = orderRule ? sortRecords(promos, orderRule) : promos;
      return promos;
    }
  },
  siteSettings: {
    upsert: async ({ where, create, update }: any) => {
      const id = where?.id || 'default';
      await upsertDoc('siteSettings', id, { ...(create || {}), ...(update || {}) });
      return singleDoc<any>('siteSettings', id);
    },
    findUnique: async ({ where }: any) => {
      const id = where?.id || 'default';
      return singleDoc<any>('siteSettings', id);
    }
  },
  webhookEvent: {
    create: async ({ data }: any) => {
      const id = data.id || randomUUID();
      await upsertDoc('webhookEvents', id, data);
      return singleDoc<any>('webhookEvents', id);
    }
  },
  user: {
    findMany: async ({ orderBy: orderRule }: any = {}) => {
      let users = await collectionData<any>('users');
      users = orderRule ? sortRecords(users, orderRule) : users;
      return users;
    },
    create: async ({ data }: any) => {
      const id = data.id || randomUUID();
      await upsertDoc('users', id, data);
      return singleDoc<any>('users', id);
    },
    findUnique: async ({ where }: any = {}) => {
      if (where?.id) return singleDoc<any>('users', where.id);
      if (where?.email) {
        const users = await collectionData<any>('users');
        return users.find((u) => u.email === where.email) || null;
      }
      return null;
    }
  }
};

export const prisma = PrismaLike;
