import { describe, it, expect } from "vitest"

import { randomShuffleSeed } from "./quick-time.utility"

describe("Quick Time Utility", () => {
  describe("randomShuffleSeed", () => {
    it("should return a number between 1 and 100", () => {
      expect(randomShuffleSeed()).toBeGreaterThan(0)
      expect(randomShuffleSeed()).toBeLessThanOrEqual(100)
    })
  })
})
