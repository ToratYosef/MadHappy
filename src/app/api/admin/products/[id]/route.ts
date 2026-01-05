import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Params {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const { title, description, slug, colors, sizes } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const colorValues: string[] | undefined = Array.isArray(colors)
      ? colors.map(String)
      : undefined;
    const sizeValues: string[] | undefined = Array.isArray(sizes)
      ? sizes.map(String)
      : undefined;

    const existing = await prisma.product.findUnique({ where: { id: params.id }, include: { variants: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const otherOptions = (existing.options as any[] | undefined)?.filter(
      (opt) => opt && typeof opt.name === 'string' && !/size/i.test(opt.name) && !/color/i.test(opt.name)
    ) || [];

    const nextOptions = [
      ...(colorValues ? [{ name: 'Color', values: colorValues }] : []),
      ...(sizeValues ? [{ name: 'Size', values: sizeValues }] : []),
      ...otherOptions
    ];

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        title,
        description,
        slug,
        options: nextOptions
      }
    });

    if (colorValues || sizeValues) {
      const normalize = (val: string) => val?.toString().trim().toLowerCase();
      const allowedColors = new Set((colorValues || []).map((c) => normalize(c)));
      const allowedSizes = new Set((sizeValues || []).map((s) => normalize(s)));

      await Promise.all(
        existing.variants.map((variant) => {
          const entries = Object.entries((variant.options as Record<string, string>) || {});

          // Classify values as color/size using both keys and the allowed sets; swap if misaligned.
          const valueMatchesColor = entries.find(([, value]) => allowedColors.has(normalize(value)))?.[1];
          const valueMatchesSize = entries.find(([, value]) => allowedSizes.has(normalize(value)))?.[1];

          const colorEntry =
            valueMatchesColor ??
            entries.find(([key]) => /color/i.test(key))?.[1] ??
            entries.find(([key]) => /colour/i.test(key))?.[1] ??
            '';

          const sizeEntry =
            valueMatchesSize ??
            entries.find(([key]) => /size/i.test(key))?.[1] ??
            '';

          const enabledColor = allowedColors.size ? allowedColors.has(normalize(colorEntry)) : true;
          const enabledSize = allowedSizes.size ? allowedSizes.has(normalize(sizeEntry)) : true;
          const shouldEnable = enabledColor && enabledSize;

          const nextOptions: Record<string, string> = { ...(variant.options as Record<string, string>) };
          if (colorValues && colorEntry) nextOptions.Color = colorEntry;
          if (sizeValues && sizeEntry) nextOptions.Size = sizeEntry;

          if (variant.isEnabled === shouldEnable &&
              (!colorValues || nextOptions.Color === (variant.options as any).Color) &&
              (!sizeValues || nextOptions.Size === (variant.options as any).Size)) {
            return Promise.resolve();
          }

          return prisma.productVariant.update({
            where: { id: variant.id },
            data: { isEnabled: shouldEnable, options: nextOptions }
          });
        })
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Failed to update product', error);
    return NextResponse.json({ error: 'Failed to update product', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Failed to delete product', error);
    return NextResponse.json({ error: 'Failed to delete product', details: String(error) }, { status: 500 });
  }
}
