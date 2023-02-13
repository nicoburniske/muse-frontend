/** @type {import('tailwindcss').Config} */
module.exports = {
   plugins: [
      require('@tailwindcss/aspect-ratio'),
      require('@tailwindcss/typography'),
      require('@tailwindcss/line-clamp'),
      require('tailwindcss-animate'),
      require('daisyui'),
   ],
   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
   theme: {
      extend: {
         keyframes: {
            'accordion-down': {
               from: { height: 0 },
               to: { height: 'var(--radix-accordion-content-height)' },
            },
            'accordion-up': {
               from: { height: 'var(--radix-accordion-content-height)' },
               to: { height: 0 },
            },
         },
         animation: {
            'accordion-down': 'accordion-down 0.2s ease-out',
            'accordion-up': 'accordion-up 0.2s ease-out',
         },
      },
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
