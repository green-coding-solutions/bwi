import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Same API routes as nginx.conf, but against PetClinic on localhost:9966.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/status": {
        target: "http://localhost:9966",
        rewrite: () => "/petclinic/api/visits",
      },
      "/api": {
        target: "http://localhost:9966",
        rewrite: (path) => path.replace(/^\/api/, "/petclinic/api"),
      },
    },
  },
});
