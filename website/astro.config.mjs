import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
  },
});
