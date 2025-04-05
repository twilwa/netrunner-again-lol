/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
        cyber: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        cyber: {
          blue: '#5ce1e6',
          purple: '#bf5cff',
          red: '#ff3860',
          green: '#36e47c',
          yellow: '#ffdd57',
          orange: '#ff7849',
        },
      },
      boxShadow: {
        'neon': '0 0 5px rgba(92, 225, 230, 0.7), 0 0 10px rgba(92, 225, 230, 0.5), 0 0 15px rgba(92, 225, 230, 0.3)',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["cyberpunk"],
  },
}
