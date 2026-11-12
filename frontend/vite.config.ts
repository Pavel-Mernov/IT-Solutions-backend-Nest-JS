import { defineConfig } from "vite";
export default defineConfig({
  server: {
    proxy: { "/graphql": process.env.BACKEND_URL ?? "http://127.0.0.1:3000" },
  },
});
