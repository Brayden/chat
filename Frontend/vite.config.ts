// import { reactRouter } from "@react-router/dev/vite";
// import tailwindcss from "@tailwindcss/vite";
// import { defineConfig } from "vite";
// import tsconfigPaths from "vite-tsconfig-paths";

// export default defineConfig({
//   plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
// });


import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from 'path'

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./workers/app.ts",
        }
      : undefined,
  },
  plugins: [
    cloudflareDevProxy({
      getLoadContext({ context }) {
        return { cloudflare: context.cloudflare };
      },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '~': resolve(__dirname, './app')
    }
  }
}));