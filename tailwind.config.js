/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,html}"],
  darkMode: "media",
  prefix: "plasmo-",
  theme: {
    extend: {
      fontFamily: {
        'asul': ['Asul', 'system-ui', 'sans-serif'],
        'sans': ['Asul', 'system-ui', 'sans-serif'], // Make Asul the default sans font
      }
    }
  }
}
