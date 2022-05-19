const colors = require('tailwindcss/colors')

module.exports = {
	mode: 'jit',
	content: ['./public/**/*.html', './src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			sans: ['Open Sans', 'sans-serif'],
			serif: ['Source Sans Pro', 'sans-serif'],
		},
		extend: {
			typography: {
				DEFAULT: {
					css: {
						a: {
							color: colors.indigo[600],
							'&:hover': {
								color: colors.indigo[700],
							},
						},
						h1: {
							color: colors.indigo[600]
						},
						h2: {
							color: colors.indigo[600]
						},
						h3: {
							color: colors.indigo[600]
						},
						h4: {
							color: colors.indigo[600]
						},
						h5: {
							color: colors.indigo[600]
						},
						h6: {
							color: colors.indigo[600]
						},
					},
				},
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography')
	]
};
