// @ts-check
import typescriptParser from "@typescript-eslint/parser";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  files: ["server/**/*.ts"],
  languageOptions: {
    parser: typescriptParser,
  },
});
