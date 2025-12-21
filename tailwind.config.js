/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Outdoor-friendly colors with good contrast
        forest: {
          50: '#f0f7f4',
          100: '#dceee6',
          200: '#b9dccf',
          300: '#8bc5b0',
          400: '#5da78e',
          500: '#3e8a73',
          600: '#2d6f5c',
          700: '#25594b',
          800: '#1f473d',
          900: '#1b3b33',
        },
        // High contrast colors for outdoor visibility
        'outdoor-orange': '#ff6b35',
        'outdoor-yellow': '#f7b801',
        'outdoor-blue': '#004e89',
      },
      fontSize: {
        // Minimum 16px for outdoor readability
        'outdoor-sm': '16px',
        'outdoor-base': '18px',
        'outdoor-lg': '20px',
        'outdoor-xl': '24px',
      },
      spacing: {
        // 44x44 point minimum touch targets
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
