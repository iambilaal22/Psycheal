/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': 'var(--brand-primary)',
        'brand-primary-hover': 'var(--brand-primary-hover)',
        'brand-secondary': 'var(--brand-secondary)',
        'brand-bg': 'var(--brand-bg)',
        'brand-panel': 'var(--brand-panel)',
        'brand-border': 'var(--brand-border)',
        'brand-text': 'var(--brand-text)',
        'brand-text-muted': 'var(--brand-text-muted)',
        'brand-crisis-primary': 'var(--brand-crisis-primary)',
        'brand-crisis-secondary': 'var(--brand-crisis-secondary)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
