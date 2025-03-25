import { defineConfig, mergeConfig } from "vitest/config"

import viteConfig from "./vite.config"

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "happy-dom",
      mockReset: true,
      fakeTimers: {
        toFake: ["performance"],
      },
      setupFiles: "./vitest.setup.ts",
      coverage: {
        include: ["src/*"],
        exclude: ["src/confetti", "**/*.d.ts"],
      },
    },
  })
)
