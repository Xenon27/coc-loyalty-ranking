// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'


export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    // ... your configuration
    theme: {
      defaultTheme: "customDarkTheme",
      themes: {
        customDarkTheme,
      },
    }
  })
  app.vueApp.use(vuetify)
})

const customDarkTheme = {
  dark: true,
  colors: {
    background: "#121212",
    surface: "#121212",
    primary: "#121212",
    secondary: "#d4af37",
  },
};
