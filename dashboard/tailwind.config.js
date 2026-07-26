/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          blue: '#3b82f6',      // Diagnostic soft blue
          accent: '#2563eb',    // Interactive blue
          lightBg: '#f8fafc',   // Healthcare white/gray base
          green: '#10b981',     // Emerald healthy
          greenBg: '#ecfdf5',   // Healthy background
          orange: '#f59e0b',    // Alert orange
          orangeBg: '#fffbeb',  // Alert background
          red: '#ef4444',       // Critical red
          redBg: '#fef2f2',     // Critical background
          card: '#f1f5f9',      // Sleek gray cards
          border: '#e2e8f0',    // Clean diagnostic borders
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
