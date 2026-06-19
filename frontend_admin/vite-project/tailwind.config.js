/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'Segoe UI', 'Roboto', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'], // Font hỗ trợ tiếng Việt
        display: ['Outfit', 'Inter', 'sans-serif'], // Font cho tiêu đề
      },
    },
  },
  plugins: [
    // formsPlugin,
  ],
}

