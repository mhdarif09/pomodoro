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
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                green: {
                    50: '#eafff3',
                    100: '#ccffe3',
                    200: '#99ffc7',
                    300: '#59ffaa',
                    400: '#00e680',
                    500: '#00522a', // User requested color as Primary
                    600: '#004222',
                    700: '#00331a',
                    800: '#002613',
                    900: '#001a0d',
                    950: '#000d07',
                },
            },
        },
    },

    plugins: [],
    corePlugins: {
        preflight: true,
    },
    important: false, // Jangan set true
};
