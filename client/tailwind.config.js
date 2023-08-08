/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "public/index.html"],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    colors: {
      blue: "#0192CE",
      "grey-light": "#9E9FA3",
      white: "#FFFFFF",
      red: "#CA2C46",
      grey: "#212121", // contrast checked https://webaim.org/resources/contrastchecker/
      black: "#221F21",
    },
    fontFamily: {
      sans: ["Graphik", "sans-serif"],
      serif: ["Merriweather", "serif"],
    },
    extend: {
      animation: {
        wiggle: "wiggle 2s ease-in-out infinite",
        scroll: "scroll 1.25s linear 1 forwards",
        'last-scroll': "last-scroll 1.25s linear 1 forwards"
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        scroll: {
          "0%" : { transform: 'translateY(-2rem%)'},
          "100%" : { transform: 'translateY(25rem)' }
        },
        'last-scroll': {
          "0%" : { transform: 'translateY(-2rem%)'},
          "100%" : { transform: 'translateY(12rem)' }
        }
      },
      spacing: {
        128: "32rem",
        144: "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
