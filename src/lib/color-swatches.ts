// Centralized color swatch resolver so product cards and PDP swatches stay in sync
const COLOR_MAP: Record<string, string> = {
  // Neutral tones
  black: '#111111',
  white: '#f7f7f7',
  charcoal: '#4a4a4a',
  ash: '#d6d6d6',
  grey: '#808080',
  gray: '#808080',
  'sport grey': '#a8a8a8',
  'dark heather': '#414141',
  'graphite heather': '#5b6066',
  // Blues
  navy: '#0f1d3b',
  'dark navy': '#0d1630',
  'navy blue': '#0f1d3b',
  'heather navy': '#2c3a52',
  'heather sport dark navy': '#1f2b3f',
  'heather sport royal': '#1c4fa1',
  royal: '#1f4ea3',
  'indigo blue': '#274472',
  'light blue': '#8fbbe8',
  'carolina blue': '#4f87c3',
  'antique sapphire': '#0e8fc9',
  'tropical blue': '#00b4d8',
  'jade dome': '#00a86b',
  sky: '#87ceeb',
  'stone blue': '#5b7c99',
  'heather indigo': '#4f69c6',
  blue: '#0000ff',
  // Greens
  'forest green': '#2f5d37',
  'military green': '#4b5320',
  kiwi: '#7fbf3f',
  'irish green': '#008645',
  'safety green': '#8bc53f',
  'kelly green': '#4cbb17',
  'heather irish green': '#5fad56',
  green: '#008000',
  sage: '#9caf88',
  // Pinks / purples
  purple: '#6a2da8',
  orchid: '#da70d6',
  'heather radiant orchid': '#b565a7',
  'light pink': '#f6c4d5',
  azalea: '#e92f8d',
  'safety pink': '#ff69b4',
  heliconia: '#e20074',
  pink: '#ffc0cb',
  // Reds
  red: '#d02626',
  'antique cherry red': '#a02128',
  'cherry red': '#c21834',
  garnet: '#7e1e34',
  'cardinal red': '#9d2235',
  maroon: '#6d0019',
  'heather cardinal': '#9b2d30',
  'antique cherry': '#a02128',
  // Oranges / yellows / earth tones
  gold: '#d4af37',
  orange: '#f2841f',
  'safety orange': '#ff7a00',
  yellow: '#ffff00',
  sand: '#d4c5a5',
  beige: '#f5f5dc',
  brown: '#a52a2a',
  'dark chocolate': '#4b2e2b',
  // Misc
  navyblue: '#0f1d3b',
  'ice grey': '#d3d3d3'
};

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const toHashColor = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 55%)`;
};

export const resolveSwatchColor = (rawValue: string) => {
  const value = rawValue?.trim() ?? '';
  const normalized = value.toLowerCase();

  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];
  if (HEX_PATTERN.test(value)) return value;
  if (/^rgba?/i.test(value)) return value;

  return toHashColor(normalized || value);
};
