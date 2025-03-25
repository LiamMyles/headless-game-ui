import { beforeAll } from "vitest"

import { configure } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

beforeAll(() => {
  configure({ reactStrictMode: true })
})
