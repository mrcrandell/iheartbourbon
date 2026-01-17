// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "nuxt-auth-utils",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
  ],

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
    public: {
      // Add site URL for easy access in components
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ||
        "https://www.iheartbourbon.com",
    },
  },

  components: [
    // ~/components/icons/IconArrowLeft.vue => <IconArrowLeft />
    { path: "~/components/icons", pathPrefix: false },
    // It's important that this comes last if you have overrides you wish to apply
    // to sub-directories of `~/components`.
    "~/components",
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
