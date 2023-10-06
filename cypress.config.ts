import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
  },
  env: {
    CORIOLIS_URL: "https://invalidd.it/",
  },
});
