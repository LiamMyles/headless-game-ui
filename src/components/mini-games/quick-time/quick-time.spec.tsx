import { render, screen, getByRole } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { QuickTime } from "./"
import userEvent from "@testing-library/user-event"

vi.mock(import("./quick-time.utility"), async (importOriginals) => {
  const mod = await importOriginals()
  return {
    ...mod,
    //Remove randomness from function
    randomShuffleSeed: vi.fn(() => {
      return 42
    }),
  }
})

vi.mock(import("../../../confetti"), async (importOriginals) => {
  const mod = await importOriginals()
  return {
    ...mod,
    fireworkConfetti: vi.fn(),
  }
})

describe("Quick Time Component", () => {
  describe("Key States", () => {
    it("should update the keys as the user does successful input", async () => {
      render(<QuickTime />)

      const keyList = screen.getAllByRole("listitem")

      const firstKey = getByRole(keyList[0], "img")
      const secondKey = getByRole(keyList[1], "img")
      const thirdKey = getByRole(keyList[2], "img")
      const forthKey = getByRole(keyList[3], "img")

      expect(firstKey).toHaveAccessibleName("current key ArrowDown")
      expect(secondKey).toHaveAccessibleName("upcoming key ArrowUp")
      expect(thirdKey).toHaveAccessibleName("upcoming key ArrowRight")
      expect(forthKey).toHaveAccessibleName("upcoming key ArrowLeft")

      await userEvent.keyboard("{ArrowDown}")

      expect(firstKey).toHaveAccessibleName("successful key ArrowDown")
      expect(secondKey).toHaveAccessibleName("current key ArrowUp")
      expect(thirdKey).toHaveAccessibleName("upcoming key ArrowRight")
      expect(forthKey).toHaveAccessibleName("upcoming key ArrowLeft")

      await userEvent.keyboard("{ArrowUp}")

      expect(firstKey).toHaveAccessibleName("successful key ArrowDown")
      expect(secondKey).toHaveAccessibleName("successful key ArrowUp")
      expect(thirdKey).toHaveAccessibleName("current key ArrowRight")
      expect(forthKey).toHaveAccessibleName("upcoming key ArrowLeft")

      await userEvent.keyboard("{ArrowRight}")

      expect(firstKey).toHaveAccessibleName("successful key ArrowDown")
      expect(secondKey).toHaveAccessibleName("successful key ArrowUp")
      expect(thirdKey).toHaveAccessibleName("successful key ArrowRight")
      expect(forthKey).toHaveAccessibleName("current key ArrowLeft")

      await userEvent.keyboard("{ArrowLeft}")

      expect(firstKey).toHaveAccessibleName("successful key ArrowDown")
      expect(secondKey).toHaveAccessibleName("successful key ArrowUp")
      expect(thirdKey).toHaveAccessibleName("successful key ArrowRight")
      expect(forthKey).toHaveAccessibleName("successful key ArrowLeft")
    })

    it("should highlight the upcoming key", () => {
      render(<QuickTime />)

      const keyList = screen.getAllByRole("listitem")

      const firstKey = getByRole(keyList[0], "img")

      expect(firstKey).toHaveAccessibleName("current key ArrowDown")
    })

    it("should highlight when a key is correct", async () => {
      render(<QuickTime />)

      const keyList = screen.getAllByRole("listitem")

      const firstKey = getByRole(keyList[0], "img")

      expect(firstKey).toHaveAccessibleName("current key ArrowDown")

      await userEvent.keyboard("{ArrowDown}")

      expect(firstKey).toHaveAccessibleName("successful key ArrowDown")
    })

    it("should highlight when a key is incorrect", async () => {
      render(<QuickTime />)

      const keyList = screen.getAllByRole("listitem")

      const firstKey = getByRole(keyList[0], "img")

      expect(firstKey).toHaveAccessibleName("current key ArrowDown")

      await userEvent.keyboard("{ArrowUp}")

      expect(firstKey).toHaveAccessibleName("failed on key ArrowDown")
    })
  })
  describe("Game States", () => {
    it.todo("should alert the user when they win")
    it.todo("should alert the user when they lose")
  })
  describe("Timer", () => {
    it.todo("should decrease timer as time goes by")
    it.todo("should alert user that they have lost when timer expires")
  })
})
