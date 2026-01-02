import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8f5ef',
        foreground: '#0f0f0f',
        taupe: '#c2b8a3',
        green: '#12312b',
        gold: '#b59645'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.05)'
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

export default config;
