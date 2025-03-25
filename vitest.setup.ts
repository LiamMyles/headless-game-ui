import { afterEach, beforeAll } from "vitest"

import { cleanup, configure } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

afterEach(() => {
  cleanup()
})

beforeAll(() => {
  configure({ reactStrictMode: true })
})
