/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // JetBrains Mono 若未載入網路字型會自動 fallback 至系統等寬字體
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        brand: {
          cyan: '#22d3ee',
          emerald: '#34d399',
          amber: '#fbbf24',
          rose: '#f43f5e',
        },
      },
    },
  },
  plugins: [],
};
