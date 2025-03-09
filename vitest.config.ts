import { defineConfig, mergeConfig } from "vitest/config"

import viteConfig from "./vite.config"

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "happy-dom",
      fakeTimers: {
        toFake: ["performance"],
      },
      setupFiles: "./vitest.setup.ts",
    },
  })
)
