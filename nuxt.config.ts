// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "nuxt-mongoose"],
  typescript: {
    tsConfig: {
      include: ["~/types/*.d.ts"],
    },
  },
  mongoose: {
    uri: process.env.MONGODB_URI || "",
    modelsDir: "server/models",
  },
});
