import type { PrintifyOption, PrintifyVariant } from '@/types/printify';

const normalizeOptionValue = (opt: PrintifyOption, value: unknown) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  const mappedById = opt.valueIdMap?.[stringValue];
  if (mappedById) return mappedById;

  const matchedEntry = Object.entries(opt.valueIdMap || {}).find(
    ([, title]) => title.toLowerCase() === stringValue.toLowerCase()
  );
  if (matchedEntry) return matchedEntry[1];

  return stringValue;
};

export const getInitialSelections = (options: PrintifyOption[], variants: PrintifyVariant[] = []) => {
  const firstVariant = variants[0];
  if (firstVariant) {
    return Object.fromEntries(
      options.map((opt) => {
        const normalizedOptions = Object.fromEntries(
          Object.entries(firstVariant.options || {}).map(([k, v]) => [k.toLowerCase(), v])
        );
        const rawValue =
          (firstVariant.options?.[opt.name] as string | undefined) ??
          normalizedOptions[opt.name.toLowerCase()] ??
          opt.values?.[0] ??
          '';
        return [opt.name, normalizeOptionValue(opt, rawValue)];
      })
    );
  }

  return Object.fromEntries(options.map((opt) => [opt.name, opt.values?.[0] ?? '']));
};

const selectionKey = (options: PrintifyOption[], selections: Record<string, string>) =>
  options.map((opt) => normalizeOptionValue(opt, selections[opt.name])).join('|');

export const buildVariantLookup = (options: PrintifyOption[], variants: PrintifyVariant[]) =>
  variants.reduce<Record<string, PrintifyVariant>>((acc, variant) => {
    const key = selectionKey(
      options,
      Object.fromEntries(
        options.map((opt) => {
          const normalizedOptions = Object.fromEntries(
            Object.entries(variant.options || {}).map(([k, v]) => [k.toLowerCase(), v])
          );
          const rawValue = variant.options?.[opt.name] || normalizedOptions[opt.name.toLowerCase()] || '';
          return [opt.name, normalizeOptionValue(opt, rawValue)];
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
