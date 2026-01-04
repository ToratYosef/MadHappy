import type { PrintifyOption, PrintifyVariant } from '@/types/printify';

const normalizeOptionValue = (opt: PrintifyOption, value: unknown) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  const mappedById = opt.valueIdMap?.[stringValue];
  if (mappedById) return mappedById;

  const matchedEntry = Object.entries(opt.valueIdMap || {}).find(([_, title]) => {
    if (typeof title !== 'string') return false;
    return title.toLowerCase() === stringValue.toLowerCase();
  });
  if (matchedEntry && typeof matchedEntry[1] === 'string') return matchedEntry[1];

  return stringValue;
};

export const getInitialSelections = (options: PrintifyOption[], variants: PrintifyVariant[] = []) => {
  const preferredVariant = findPreferredVariant(options, variants);
  const fallbackVariant = variants[0];
  const variantForDefaults = preferredVariant ?? fallbackVariant;

  if (variantForDefaults) {
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
    const key = selectionKey(options, selectionsForVariant);
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
