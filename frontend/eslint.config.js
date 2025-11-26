import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["node_modules", "dist", "coverage", ".vite", ".output", "**/*.ts"],
  },
  pluginVue.configs["flat/essential"],
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        // Vitest globals
        test: true,
        expect: true,
        describe: true,
        beforeEach: true,
        afterEach: true,
        vi: true,
      },
    },
  },
]);
