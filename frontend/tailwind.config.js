/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
            // NextGen Custom Deep Dark Theme - using literal hex values for Tailwind v4 compatibility
            background: '#050505',
            foreground: '#f8f8f8',
            panel: 'rgba(255,255,255,0.03)',
            panelBorder: 'rgba(255,255,255,0.08)',
            primary: {
                DEFAULT: '#8b5cf6',
                hover: '#7c3aed',
            },
            accent: '#3b82f6',
            muted: '#a1a1aa',
        },
        fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        animation: {
            'blob': 'blob 7s infinite',
            'float': 'float 6s ease-in-out infinite',
            'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
            blob: {
                '0%': { transform: 'translate(0px, 0px) scale(1)' },
                '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                '100%': { transform: 'translate(0px, 0px) scale(1)' },
            },
            float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
            },
            'pulse-glow': {
                '0%, 100%': { opacity: '1' },
                '50%': { opacity: '.5' },
            }
        }
      },
    },
    plugins: [],
  }
