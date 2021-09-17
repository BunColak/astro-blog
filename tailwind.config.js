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
              }
            }
          }
        })
      }
    },
    plugins: [
      require('@tailwindcss/typography'),
    ]
  };
  