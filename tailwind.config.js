/** @type {import('tailwindcss').Config} */
module.exports = {
   plugins: [
      require('@tailwindcss/aspect-ratio'),
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
      require('daisyui'),
   ],
   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
   theme: {
      extend: {},
   },
}
