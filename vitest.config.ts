import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

// O Vitest herda a configuração do Vite, inclusive os aliases de camada
// (@app, @ui-kit, @core, @audio, @persistence, @services e @modules),
// que assim ficam idênticos aos do Vite e aos "paths" do tsconfig.app.json.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",
      include: ["tests/**/*.test.{ts,tsx}"],
    },
  }),
);
