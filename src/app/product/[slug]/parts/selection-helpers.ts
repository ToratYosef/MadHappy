import type { PrintifyOption, PrintifyVariant } from '@/types/printify';

export const isColorOption = (name: string) => /color/i.test(name);

export const normalizeOptionValue = (opt: PrintifyOption, value: unknown) => {
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

const getVariantOptionValue = (variant: PrintifyVariant, opt: PrintifyOption) => {
  const normalizedOptions = Object.fromEntries(
    Object.entries(variant.options || {}).map(([k, v]) => [k.toLowerCase(), v])
  );
  const rawValue = variant.options?.[opt.name] || normalizedOptions[opt.name.toLowerCase()] || '';
  return normalizeOptionValue(opt, rawValue);
};

const sortByOptionOrder = (values: string[], option: PrintifyOption) => {
  const ordering = new Map((option.values || []).map((value, idx) => [normalizeOptionValue(option, value), idx]));
  return Array.from(new Set(values)).sort((a, b) => {
    const aIndex = ordering.get(a);
    const bIndex = ordering.get(b);
    if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
    if (aIndex !== undefined) return -1;
    if (bIndex !== undefined) return 1;
    return a.localeCompare(b);
  });
};

const findPreferredVariant = (options: PrintifyOption[], variants: PrintifyVariant[]) => {
  const colorOption = options.find((opt) => isColorOption(opt.name));
  if (!colorOption) return variants[0] ?? null;

  const preferredColor = variants.find((variant) => {
    const value = getVariantOptionValue(variant, colorOption);
    return /white/i.test(value);
  });

  return preferredColor ?? variants[0] ?? null;
};

export const getInitialSelections = (options: PrintifyOption[], variants: PrintifyVariant[] = []) => {
  const preferredVariant = findPreferredVariant(options, variants);
  const fallbackVariant = variants[0];
  const variantForDefaults = preferredVariant ?? fallbackVariant;

  if (variantForDefaults) {
    return Object.fromEntries(
      options.map((opt) => {
        const rawValue = getVariantOptionValue(variantForDefaults, opt) || opt.values?.[0] || '';
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
      Object.fromEntries(options.map((opt) => [opt.name, getVariantOptionValue(variant, opt)]))
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

export const getAvailableValues = (
  options: PrintifyOption[],
  variants: PrintifyVariant[],
  selections: Record<string, string>,
  optionName: string
) => {
  const targetOption = options.find((opt) => opt.name === optionName);
  if (!targetOption) return [];

  const filteredVariants = variants.filter((variant) =>
    options.every((opt) => {
      if (opt.name === targetOption.name) return true;
      const selected = selections[opt.name];
      if (!selected) return true;
      return getVariantOptionValue(variant, opt) === normalizeOptionValue(opt, selected);
    })
  );

  const values = filteredVariants.map((variant) => getVariantOptionValue(variant, targetOption)).filter(Boolean);
  return sortByOptionOrder(values, targetOption);
};

export const buildSelectionKey = selectionKey;
