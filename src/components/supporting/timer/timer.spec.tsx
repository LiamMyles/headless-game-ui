import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

import { act, renderHook } from "@testing-library/react"

import createMockRaf from "mock-raf"
import { useTimer } from "./timer.hook"

function getMockedRaf(): createMockRaf.Creator {
  const mockedRaf = createMockRaf()

  vi.spyOn(window, "requestAnimationFrame").mockImplementation(mockedRaf.raf)
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(mockedRaf.cancel)

  return mockedRaf
}

describe("Timer", () => {
  describe("Hook", () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.clearAllMocks()
      vi.useRealTimers()
    })
    afterAll(() => {
      vi.restoreAllMocks()
    })

    it("should return true after counting down from 1 second", async () => {
      const mockedRaf = getMockedRaf()

      const { result } = renderHook(() => useTimer({ seconds: 1 }))

      expect(result.current.isFinished).toBe(false)

      await act(async () => {
        mockedRaf.step({ count: 10, time: 100 })
      })

      expect(result.current.isFinished).toBe(true)
    })

    it("should return true after 5 seconds", async () => {
      const mockedRaf = getMockedRaf()

      const { result } = renderHook(() => useTimer({ seconds: 5 }))

      expect(result.current.isFinished).toBe(false)

      await act(async () => {
        mockedRaf.step({ count: 25, time: 100 })
      })

      expect(result.current.isFinished).toBe(false)
      await act(async () => {
        mockedRaf.step({ count: 25, time: 100 })
      })

      expect(result.current.isFinished).toBe(true)
    })

    it("should update returned time left every 500ms", async () => {
      const mockedRaf = getMockedRaf()

      const { result } = renderHook(() => useTimer({ seconds: 2 }))

      expect(result.current.timeLeft).toEqual(2000)

      await act(async () => {
        mockedRaf.step({ count: 5, time: 100 })
      })

      expect(result.current.timeLeft).toEqual(1500)

      await act(async () => {
        mockedRaf.step({ count: 4, time: 100 })
      })

      expect(result.current.timeLeft).toEqual(1500)

      await act(async () => {
        mockedRaf.step({ count: 1, time: 100 })
      })

      expect(result.current.timeLeft).toEqual(1000)

      await act(async () => {
        mockedRaf.step({ count: 10, time: 100 })
      })

      expect(result.current.timeLeft).toEqual(0)
      expect(result.current.isFinished).toEqual(true)
    })

    it("should never return time left below 0", async () => {
      const mockedRaf = getMockedRaf()

      const { result } = renderHook(() => useTimer({ seconds: 1 }))

      await act(async () => {
        mockedRaf.step({ time: 600 })
      })

      await act(async () => {
        mockedRaf.step({ time: 600 })
      })

      expect(result.current.timeLeft).toEqual(0)
    })

    it("should not start if isRunning is false", async () => {
      const mockedRaf = getMockedRaf()

      const { result, rerender } = renderHook(
        ({ isRunning }) => useTimer({ seconds: 1, isRunning: isRunning }),
        { initialProps: { isRunning: false } }
      )

      await act(async () => {
        mockedRaf.step({ time: 1200 })
      })

      expect(result.current.timeLeft).not.toEqual(0)

      rerender({ isRunning: true })

      await act(async () => {
        mockedRaf.step({ time: 1200 })
      })

      expect(result.current.timeLeft).toEqual(0)
      expect(result.current.isFinished).toEqual(true)
    })

    it("should pause if isRunning changes midway through", async () => {
      const mockedRaf = getMockedRaf()

      const { result, rerender } = renderHook(
        ({ isRunning }) => useTimer({ seconds: 2, isRunning: isRunning }),
        { initialProps: { isRunning: true } }
      )

      expect(result.current.timeLeft).toEqual(2000)

      await act(async () => {
        mockedRaf.step({ time: 1000 })
      })

      expect(result.current.timeLeft).toEqual(1000)

      rerender({ isRunning: false })

      await act(async () => {
        mockedRaf.step({ time: 1200 })
      })

      expect(result.current.timeLeft).toEqual(1000)
      expect(result.current.isFinished).toEqual(false)

      rerender({ isRunning: true })

      expect(result.current.timeLeft).toEqual(1000)
      expect(result.current.isFinished).toEqual(false)

      await act(async () => {
        mockedRaf.step({ time: 1200 })
      })
      expect(result.current.timeLeft).toEqual(0)
      expect(result.current.isFinished).toEqual(true)
    })
  })
})
