// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/styles/main.scss"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "${process.cwd()}/app/styles/utils" as *;\n@use "${process.cwd()}/app/styles/variables" as *;\n`,
        },
      },
    },
  },
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
  app: {
    head: {
      title: "3D genealogy tapestry",
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon.svg",
        },
      ],
    },
  },
});
