// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/fonts", "nuxt-auth-utils"],

  runtimeConfig: {
    oauth: {
      google: {
        clientId: "",
        clientSecret: "",
      },
      facebook: {
        clientId: "",
        clientSecret: "",
      },
      apple: {
        clientId: "",
        clientSecret: "",
      },
    },
  },

  css: [
    "~/assets/scss/base.scss",
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/assets/scss/_variables.scss" as *;
            @use "~/assets/scss/_functions.scss" as *;
            @use "~/assets/scss/_mixins.scss" as *;
          `,
        },
      },
    },
  },
});
