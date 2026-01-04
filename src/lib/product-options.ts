export function orderProductOptions(options: any[] = []) {
  if (!Array.isArray(options)) return [];

  const score = (opt: any) => {
    const name = String(opt?.name || '').toLowerCase();
    const type = String(opt?.type || '').toLowerCase();

    if (type === 'color' || name.includes('color') || name.includes('colour')) return 0;
    if (type === 'size' || /(^|\b)(size|s|waist|length|inseam|chest|width)(\b|$)/i.test(name)) return 1;
    return 2;
  };

  return [...options].sort((a, b) => {
    const sa = score(a);
    const sb = score(b);
    if (sa !== sb) return sa - sb;
    return String(a?.name || '').localeCompare(String(b?.name || ''));
  });
}
