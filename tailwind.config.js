/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sap-blue': '#0070f3',
        'critical': '#ef4444',
        'warning': '#f59e0b',
        'success': '#10b981',
        'overproduction': '#3b82f6',
      },
    },
  },
  plugins: [],
} 