import { vi } from "vitest"
import createMockRaf from "mock-raf"

export function getMockedRaf(): createMockRaf.Creator {
  const mockedRaf = createMockRaf()

  vi.spyOn(window, "requestAnimationFrame").mockImplementation(mockedRaf.raf)
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(mockedRaf.cancel)

  return mockedRaf
}
