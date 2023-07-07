import { defineConfig } from "vite";
import path from "path";
import vue from "@vitejs/plugin-vue";

import addHeadersPlugin from "./src/plugins/addHeaders.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [addHeadersPlugin(), vue()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        gif: path.resolve(__dirname, "gif.html"),
        collage: path.resolve(__dirname, "collage.html"),
        conversion: path.resolve(__dirname, "conversion.html"),
        csvMove: path.resolve(__dirname, "csv-move.html"),
      },
    },
  },
  resolve: {
    // 配置路径别名
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
  },
});
