/** @type {import('tailwindcss').Config} */

// Colour names here mirror src/lib/tokens.ts exactly. The rgb(var(--x) /
// <alpha-value>) form is what lets `border-accent/60` keep working; a bare
// var() in an arbitrary value cannot take an opacity modifier.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        raised: token('raised'),
        rule: token('rule'),
        'rule-strong': token('rule-strong'),
        fg: token('fg'),
        'fg-warm': token('fg-warm'),
        'fg-muted': token('fg-muted'),
        'fg-dim': token('fg-dim'),
        'fg-ghost': token('fg-ghost'),
        accent: token('accent'),
        'accent-hot': token('accent-hot'),
        signal: token('signal'),
        'signal-hot': token('signal-hot'),
        alert: token('alert'),
        ember: token('ember'),
      },
    },
  },
  plugins: [],
};
