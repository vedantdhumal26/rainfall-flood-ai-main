/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Command center surface palette
        base: {
          950: '#070b14',
          900: '#0a1020',
          850: '#0d1426',
          800: '#111a30',
          750: '#162038',
          700: '#1b2845',
          650: '#213056',
          600: '#283a68',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        risk: {
          low: '#22c55e',
          lowDim: '#16a34a',
          moderate: '#eab308',
          moderateDim: '#ca8a04',
          high: '#f97316',
          highDim: '#ea580c',
          severe: '#ef4444',
          severeDim: '#dc2626',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pipeline-flow': 'pipelineFlow 1.5s ease-in-out',
      },
      keyframes: {
        pulseRing: {
          '0%': { opacity: '0.8', transform: 'scale(0.95)' },
          '50%': { opacity: '0.3', transform: 'scale(1.1)' },
          '100%': { opacity: '0.8', transform: 'scale(0.95)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pipelineFlow: {
          '0%': { opacity: '0.3', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '0.3', transform: 'scale(0.9)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.15)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.2)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.15)',
        'panel': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
      },
    },
  },
  plugins: [],
};
