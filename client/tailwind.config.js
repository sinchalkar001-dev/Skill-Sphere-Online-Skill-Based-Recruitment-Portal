/** @type {import('tailwindcss').Config} */

// Semantic colors resolve to CSS variables (RGB channels) defined in src/index.css,
// so every utility switches between the light and dark themes and keeps
// opacity modifiers working (e.g. bg-primary/10).
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const tone = (name) => ({
  DEFAULT: token(name),
  soft: token(`${name}-soft`),
  'soft-foreground': token(`${name}-soft-foreground`),
});

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        background: token('background'),
        foreground: token('foreground'),
        card: token('card'),
        muted: {
          DEFAULT: token('muted'),
          foreground: token('muted-foreground'),
        },
        subtle: {
          foreground: token('subtle-foreground'),
        },
        border: {
          DEFAULT: token('border'),
          strong: token('border-strong'),
        },
        input: token('input'),
        ring: token('ring'),
        primary: {
          ...tone('primary'),
          hover: token('primary-hover'),
          foreground: token('primary-foreground'),
          text: token('primary-text'),
        },
        success: tone('success'),
        warning: tone('warning'),
        danger: {
          ...tone('danger'),
          hover: token('danger-hover'),
          foreground: token('danger-foreground'),
          text: token('danger-text'),
        },
        iris: tone('iris'),
        band: {
          DEFAULT: token('band'),
          foreground: token('band-foreground'),
          muted: token('band-muted'),
        },
        meter: {
          track: token('meter-track'),
        },
      },
      boxShadow: {
        overlay: '0 16px 40px -12px rgb(var(--shadow-color) / 0.28), 0 4px 12px -4px rgb(var(--shadow-color) / 0.12)',
        lift: '0 8px 24px -12px rgb(var(--shadow-color) / 0.35)',
      },
      keyframes: {
        'segment-fill': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        'menu-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'segment-fill': 'segment-fill 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'menu-in': 'menu-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};
