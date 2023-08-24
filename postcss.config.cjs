const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const postCssImport = require('postcss-import');

const config = {
    plugins: [
        postCssImport(),
        //Some plugins, like tailwindcss/nesting, need to run before Tailwind,
        tailwindcss(),
        //But others, like autoprefixer, need to run after,
        autoprefixer
    ]
};

module.exports = config;
