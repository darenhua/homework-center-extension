/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ["./src/**/*.{tsx,html}"],
  darkMode: "media",
  prefix: "plasmo-",
  theme: {
    extend: {
      fontFamily: {
        'asul': ['"Asul"', ...defaultTheme.fontFamily.sans],
        'sans': ['"Asul"', ...defaultTheme.fontFamily.sans], // Make Asul the default sans font
      }
    }
  }
}
