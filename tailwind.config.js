/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontSize: {
        'xs':   ['0.8rem',  { lineHeight: '1.1rem'  }],
        'sm':   ['0.925rem',{ lineHeight: '1.35rem' }],
        'base': ['1.05rem', { lineHeight: '1.6rem'  }],
        'lg':   ['1.15rem', { lineHeight: '1.75rem' }],
        'xl':   ['1.3rem',  { lineHeight: '1.85rem' }],
        '2xl':  ['1.55rem', { lineHeight: '2rem'    }],
        '3xl':  ['1.95rem', { lineHeight: '2.35rem' }],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        }
      }
    }
  },
  plugins: []
}
