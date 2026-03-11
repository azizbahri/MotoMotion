import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }

          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }

          if (id.includes("node_modules/recharts")) {
            return "vendor-recharts";
          }

          if (
            id.includes("node_modules/d3-") ||
            id.includes("node_modules/internmap") ||
            id.includes("node_modules/robust-predicates")
          ) {
            return "vendor-d3";
          }

          return undefined;
        },
      },
    },
  },
});
