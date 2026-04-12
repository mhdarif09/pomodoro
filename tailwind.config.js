import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
  serif: ['Instrument Serif', 'Georgia', 'serif'],
  sans: ['DM Sans', 'system-ui', 'sans-serif'],
            },
            colors: {
  forest: '#2D6A4F',
  mint: '#D8F3DC',
  'light-green': '#74C69D',
  ink: '#1A1F1C',
  muted: '#6B7C74',
            },
        },
    },

    plugins: [],
    corePlugins: {
        preflight: true,
    },
    important: false, // Jangan set true
};
