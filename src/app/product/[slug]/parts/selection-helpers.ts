import type { ProductOption, ProductVariant } from '@/types/product';

const normalizeOptionValue = (opt: ProductOption, value: unknown) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  const mappedById = opt.valueIdMap?.[stringValue];
  if (mappedById) return mappedById;

  const matchedEntry = Object.entries(opt.valueIdMap || {}).find(([, title]) => {
    if (typeof title !== 'string') return false;
    return title.toLowerCase() === stringValue.toLowerCase();
  });
  if (matchedEntry && typeof matchedEntry[1] === 'string') return matchedEntry[1];

  return stringValue;
};

const getVariantOptionValue = (variant: ProductVariant, option: ProductOption) => {
  const normalizedOptions = Object.fromEntries(
    Object.entries(variant.options || {}).map(([k, v]) => [k.toLowerCase(), v])
  );
  const rawValue = variant.options?.[option.name] || normalizedOptions[option.name.toLowerCase()] || '';
  return normalizeOptionValue(option, rawValue);
};

const findPreferredVariant = (options: ProductOption[], variants: ProductVariant[]) => {
  const enabled = variants.filter((v) => v.isEnabled);
  if (!enabled.length) return null;
  const sorted = options.length
    ? enabled.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    : enabled;
  return sorted[0];
};

export const getInitialSelections = (options: ProductOption[], variants: ProductVariant[] = []) => {
  const preferredVariant = findPreferredVariant(options, variants);
  const fallbackVariant = variants[0];
  const variantForDefaults = preferredVariant ?? fallbackVariant;

  if (variantForDefaults) {
    return Object.fromEntries(
      options.map((opt) => {
        const rawValue =
          (variantForDefaults.options?.[opt.name] as string | undefined) ??
          Object.fromEntries(Object.entries(variantForDefaults.options || {}).map(([k, v]) => [k.toLowerCase(), v]))[
            opt.name.toLowerCase()
          ] ??
          opt.values?.[0] ??
          '';
        return [opt.name, normalizeOptionValue(opt, rawValue)];
      })
    );
  }

  return Object.fromEntries(options.map((opt) => [opt.name, opt.values?.[0] ?? '']));
};

const selectionKey = (options: ProductOption[], selections: Record<string, string>) =>
  options.map((opt) => normalizeOptionValue(opt, selections[opt.name])).join('|');

export const buildVariantLookup = (options: ProductOption[], variants: ProductVariant[]) =>
  variants.reduce<Record<string, ProductVariant>>((acc, variant) => {
    const key = selectionKey(
      options,
      Object.fromEntries(
        options.map((opt) => {
          const rawValue = getVariantOptionValue(variant, opt);
          return [opt.name, rawValue];
        })
      )
    );
    acc[key] = variant;
    return acc;
  }, {});

export const resolveVariant = (
  options: ProductOption[],
  variants: ProductVariant[],
  selections: Record<string, string>
) => {
  const lookup = buildVariantLookup(options, variants);
  const key = selectionKey(options, selections);
  return lookup[key] || variants[0] || null;
};

export const getAvailableValues = (
  options: ProductOption[],
  variants: ProductVariant[],
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

const sortByOptionOrder = (values: string[], option: ProductOption) => {
  const order = option.values || [];
  return [...new Set(values)].sort((a, b) => {
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
};

export const buildSelectionKey = selectionKey;

export const isColorOption = (name: string) => name.toLowerCase().includes('color');
