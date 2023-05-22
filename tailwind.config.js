/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#38BDF8",
          "secondary": "#818CF8",
          "accent": "#F471B5",
          "neutral": "#1E293B",
          "base-100": "#0F172A",
          "info": "#0CA5E9",
          "success": "#2DD4BF",
          "warning": "#F4BF50",
          "error": "#FB7085",
        },
      },
    ],
  },
}
