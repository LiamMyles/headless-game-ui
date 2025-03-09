import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

import { renderHook, waitFor } from "@testing-library/react"

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

      const { result } = renderHook(() => useTimer({ durationSeconds: 1 }))

      expect(result.current.isFinished).toBe(false)

      mockedRaf.step({ count: 10, time: 100 })

      await waitFor(() => {
        expect(result.current.isFinished).toBe(true)
      })
    })

    it("should return true after 5 seconds", async () => {
      const mockedRaf = getMockedRaf()

      const { result } = renderHook(() => useTimer({ durationSeconds: 5 }))

      expect(result.current.isFinished).toBe(false)

      mockedRaf.step({ count: 25, time: 100 })

      expect(result.current.isFinished).toBe(false)

      mockedRaf.step({ count: 25, time: 100 })

      await waitFor(() => {
        expect(result.current.isFinished).toBe(true)
      })
    })

    it("should update returned time left every 500ms", async () => {
      const mockedRaf = getMockedRaf()

      const { result } = renderHook(() => useTimer({ durationSeconds: 2 }))

      expect(result.current.timeLeft).toEqual(2000)

      mockedRaf.step({ count: 5, time: 100 })
      vi.advanceTimersByTime(500)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(1500)
      })

      mockedRaf.step({ count: 4, time: 100 })
      vi.advanceTimersByTime(400)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(1500)
      })
      mockedRaf.step({ count: 1, time: 100 })
      vi.advanceTimersByTime(100)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(1000)
      })
      mockedRaf.step({ count: 10, time: 100 })
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(0)
        expect(result.current.isFinished).toEqual(true)
      })
    })

    it("should never return time left below 0", async () => {
      const mockedRaf = getMockedRaf()

      const { result } = renderHook(() => useTimer({ durationSeconds: 1 }))

      mockedRaf.step({ time: 600 })

      mockedRaf.step({ time: 600 })
      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(0)
      })
    })

    it("should not start if isRunning is false", async () => {
      const mockedRaf = getMockedRaf()

      const { result, rerender } = renderHook(
        ({ isRunning }) =>
          useTimer({ durationSeconds: 1, isRunning: isRunning }),
        { initialProps: { isRunning: false } }
      )

      mockedRaf.step({ time: 1200 })

      expect(result.current.timeLeft).not.toEqual(0)

      rerender({ isRunning: true })

      mockedRaf.step({ time: 1200 })
      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(0)
        expect(result.current.isFinished).toEqual(true)
      })
    })

    it("should pause if isRunning changes midway through", async () => {
      const mockedRaf = getMockedRaf()

      const { result, rerender } = renderHook(
        ({ isRunning }) =>
          useTimer({ durationSeconds: 2, isRunning: isRunning }),
        { initialProps: { isRunning: true } }
      )

      expect(result.current.timeLeft).toEqual(2000)

      mockedRaf.step({ time: 1000 })
      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(1000)
      })
      rerender({ isRunning: false })

      mockedRaf.step({ time: 1200 })
      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(1000)
        expect(result.current.isFinished).toEqual(false)
      })
      rerender({ isRunning: true })
      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(1000)
        expect(result.current.isFinished).toEqual(false)
      })
      mockedRaf.step({ time: 1200 })
      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(0)
        expect(result.current.isFinished).toEqual(true)
      })
    })

    it("should function normally if timer starts paused and time has passed", async () => {
      const mockedRaf = getMockedRaf()

      const { result, rerender } = renderHook(
        ({ isRunning }) =>
          useTimer({ durationSeconds: 10, isRunning: isRunning }),
        { initialProps: { isRunning: false } }
      )

      expect(result.current.timeLeft).toEqual(10000)
      expect(result.current.isFinished).toEqual(false)

      mockedRaf.step({ time: 10000 })
      vi.advanceTimersByTime(10000)

      rerender({ isRunning: true })

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(10000)
        expect(result.current.isFinished).toEqual(false)
      })

      mockedRaf.step({ time: 5000 })
      vi.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(5000)
        expect(result.current.isFinished).toEqual(false)
      })

      mockedRaf.step({ time: 5000 })
      vi.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(0)
        expect(result.current.isFinished).toEqual(true)
      })
    })

    it("should not consider elapsed time since isRunning changed", async () => {
      const mockedRaf = getMockedRaf()

      const { result, rerender } = renderHook(
        ({ isRunning }) =>
          useTimer({ durationSeconds: 10, isRunning: isRunning }),
        { initialProps: { isRunning: true } }
      )

      expect(result.current.timeLeft).toEqual(10000)

      mockedRaf.step({ time: 1000 })
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(9000)
      })

      rerender({ isRunning: false })

      mockedRaf.step({ count: 10, time: 1000 })
      vi.advanceTimersByTime(10000)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(9000)
        expect(result.current.isFinished).toEqual(false)
      })

      rerender({ isRunning: true })

      mockedRaf.step({ time: 1000 })
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(8000)
        expect(result.current.isFinished).toEqual(false)
      })

      mockedRaf.step({ count: 8, time: 1000 })
      vi.advanceTimersByTime(8000)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(0)
        expect(result.current.isFinished).toEqual(true)
      })
    })

    it("should reset when seconds are changed", async () => {
      const mockedRaf = getMockedRaf()

      const { result, rerender } = renderHook(
        ({ durationSeconds }) => useTimer({ durationSeconds: durationSeconds }),
        { initialProps: { durationSeconds: 10 } }
      )

      expect(result.current.timeLeft).toEqual(10000)

      mockedRaf.step({ time: 1000 })
      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(9000)
      })

      rerender({ durationSeconds: 5 })

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(5000)
      })

      mockedRaf.step({ count: 10, time: 500 })
      vi.advanceTimersByTime(5000)

      await waitFor(() => {
        expect(result.current.timeLeft).toEqual(0)
        expect(result.current.isFinished).toEqual(true)
      })
    })
  })
})
