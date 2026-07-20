/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        premium: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.18)',
        'premium-lg': '0 4px 12px -4px rgba(15, 23, 42, 0.10), 0 24px 48px -20px rgba(15, 23, 42, 0.28)',
        glow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 20px 40px -20px rgba(15,23,42,0.5)',
      },
      keyframes: {
        pulseRail: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        nodeIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        growLine: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
        drawerIn: {
          '0%': { opacity: '0', transform: 'translateY(-6px)', maxHeight: '0' },
          '100%': { opacity: '1', transform: 'translateY(0)', maxHeight: '2000px' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.99)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)' },
        },
        barFill: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        overflowPulse: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px 1px rgba(244,63,94,0.5)' },
          '50%': { opacity: '0.75', boxShadow: '0 0 16px 3px rgba(244,63,94,0.75)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseRail: 'pulseRail 1.6s ease-in-out infinite',
        fadeIn: 'fadeIn 0.18s ease-out',
        slideUp: 'slideUp 0.25s ease-out',
        nodeIn: 'nodeIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both',
        growLine: 'growLine 0.35s ease-out both',
        drawerIn: 'drawerIn 0.3s ease-out',
        shimmer: 'shimmer 2.4s linear infinite',
        floatUp: 'floatUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        sheen: 'sheen 1.1s ease-out',
        barFill: 'barFill 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        overflowPulse: 'overflowPulse 1.8s ease-in-out infinite',
        countUp: 'countUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
