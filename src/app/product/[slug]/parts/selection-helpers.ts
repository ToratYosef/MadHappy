import type { PrintifyOption, PrintifyVariant } from '@/types/printify';

export const getInitialSelections = (options: PrintifyOption[]) =>
  Object.fromEntries(options.map((opt) => [opt.name, opt.values?.[0] ?? '']));

const selectionKey = (options: PrintifyOption[], selections: Record<string, string>) =>
  options.map((opt) => selections[opt.name] ?? '').join('|');

export const buildVariantLookup = (options: PrintifyOption[], variants: PrintifyVariant[]) =>
  variants.reduce<Record<string, PrintifyVariant>>((acc, variant) => {
    const key = selectionKey(
      options,
      Object.fromEntries(
        options.map((opt) => {
          const normalizedOptions = Object.fromEntries(
            Object.entries(variant.options || {}).map(([k, v]) => [k.toLowerCase(), v])
          );
          return [
            opt.name,
            variant.options?.[opt.name] || normalizedOptions[opt.name.toLowerCase()] || ''
          ];
        })
      )
    );
    acc[key] = variant;
    return acc;
  }, {});

export const resolveVariant = (
  options: PrintifyOption[],
  variants: PrintifyVariant[],
  selections: Record<string, string>
) => {
  const lookup = buildVariantLookup(options, variants);
  const key = selectionKey(options, selections);
  return lookup[key] || variants[0] || null;
};

export const buildSelectionKey = selectionKey;
