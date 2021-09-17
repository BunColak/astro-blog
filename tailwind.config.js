module.exports = {
    mode: 'jit',
    purge: ['./public/**/*.html', './src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}'],
    theme: {
      fontFamily: {
        display: ['Open Sans', 'sans-serif'],
        body: ['Source Sans Pro', 'sans-serif'],
      },
      extend: {
        typography: (theme) => ({
          DEFAULT: {
            css: {
              a: {
                textDecoration: 'none',
                color: theme('colors.indigo.600'),
                '&:hover': {
                  textDecoration: 'none',
                  color: theme('colors.indigo.700'),
                }
              },
              h1: {
                color: theme('colors.indigo.600'),
              },
              h2: {
                color: theme('colors.indigo.600'),
              },
              h3: {
                color: theme('colors.indigo.600'),
              },
              h4: {
                color: theme('colors.indigo.600'),
              },
              h5: {
                color: theme('colors.indigo.600'),
              },
              h6: {
                color: theme('colors.indigo.600'),
              },
            }
          }
        })
      }
    },
    plugins: [
      require('@tailwindcss/typography'),
      require('daisyui'),
    ]
  };
  