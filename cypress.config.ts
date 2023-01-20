import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://host.docker.internal:9000',
    defaultCommandTimeout: 30000,
    supportFile: 'cypress/support/index.ts',
    viewportHeight: 1080,
    viewportWidth: 1920,
  },
});
