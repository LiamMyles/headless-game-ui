import { beforeAll } from "vitest"

import { configure } from "@testing-library/react"

beforeAll(() => {
  configure({ reactStrictMode: true })
})
