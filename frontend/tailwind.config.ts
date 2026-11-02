import type { Config } from 'tailwindcss';

export default {
  content: ['./components/**/*.vue', './layouts/**/*.vue', './pages/**/*.vue', './app.vue', './error.vue', './composables/**/*.ts', './utils/**/*.ts'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' }, screens: { '2xl': '1280px' } },
    // The whole site uses exactly these 5 sizes (mobile → desktop). Other text-* sizes are intentionally not generated.
    fontSize: {
      sm: ['0.875rem', { lineHeight: '1.45' }], // 14px — badges, labels, captions, small buttons
      base: ['1rem', { lineHeight: '1.6' }], // 16px — body, buttons, inputs (16px+ prevents iOS zoom on focus)
      lg: ['clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem)', { lineHeight: '1.4' }], // 18 → 20px — card titles, lead text, menu
      h2: ['clamp(1.375rem, 1.15rem + 1.1vw, 1.875rem)', { lineHeight: '1.2' }], // 22 → 30px — section titles, prices, numbers
      h1: ['clamp(1.625rem, 1.3rem + 1.6vw, 2.5rem)', { lineHeight: '1.12' }], // 26 → 40px — page title only
    },
    extend: {
      colors: {
        espresso: '#2A1D17',
        walnut: '#4A3025',
        cream: '#F5EFE7',
        linen: '#FBF8F3',
        brass: { DEFAULT: '#B88A54', dark: '#8F6A3E', light: '#E7D6BF' },
        ink: '#231F1C',
        muted: '#6E625A',
        line: '#E6DCCF',
      },
      fontFamily: {
        sans: ['"Noto Sans Armenian"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"Noto Serif Armenian"', 'Georgia', 'serif'],
      },
      borderRadius: { card: '14px' },
      boxShadow: {
        soft: '0 1px 2px rgba(42,29,23,.06), 0 8px 24px -12px rgba(42,29,23,.18)',
        lift: '0 18px 40px -18px rgba(42,29,23,.35)',
      },
      maxWidth: { prose: '68ch' },
    },
  },
  plugins: [],
} satisfies Config;
