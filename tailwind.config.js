/** @type {import('tailwindcss').Config} */
module.exports = {
   plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/typography'), require('daisyui')],
   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
   theme: {
      extend: {},
   },
   daisyui: {
      themes: [
         {
            black: {
               ...require('daisyui/src/colors/themes')['[data-theme=black]'],
               primary: '#1DB954',
               success: '#1DB954',
            },
         },
         {
            coffee: {
               ...require('daisyui/src/colors/themes')['[data-theme=coffee]'],
               'base-content': '#b0966b',
            },
         },
         'light',
         'forest',
         'dark',
         'cupcake',
         'bumblebee',
         'emerald',
         'corporate',
         'synthwave',
         'retro',
         'cyberpunk',
         'valentine',
         'halloween',
         'garden',
         'aqua',
         'lofi',
         'pastel',
         'fantasy',
         'wireframe',
         'luxury',
         'dracula',
         'cmyk',
         'autumn',
         'business',
         'acid',
         'lemonade',
         'night',
         'coffee',
         'winter',
      ],
   },
}
