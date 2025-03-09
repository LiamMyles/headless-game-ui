import { describe, beforeEach, afterAll, it, expect, vi } from "vitest"

import MockDate from "mockdate"
import createMockRaf from "mock-raf"

import { useGameLoop } from "./use-game-loop"
import { act, renderHook } from "@testing-library/react"

describe("mock-raf", () => {
  const requestAnimationMock = vi.spyOn(window, "requestAnimationFrame")
  const cancelAnimationFrameMock = vi.spyOn(window, "cancelAnimationFrame")

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it("should stop and start loop correctly", async () => {
    const mockedRaf = createMockRaf()
    requestAnimationMock.mockImplementation(mockedRaf.raf)
    cancelAnimationFrameMock.mockImplementation(mockedRaf.cancel)

    const mockCallback = vi.fn()

    const { result, unmount } = renderHook(() =>
      useGameLoop({ logicToLoop: mockCallback, speed: 100 })
    )

    expect(cancelAnimationFrameMock).toBeCalledTimes(1)

    await act(async () => {
      mockedRaf.step({ count: 5, time: 101 })
    })

    await act(async () => {
      result.current.stopLoop()
    })

    await act(async () => {
      mockedRaf.step({ count: 5, time: 101 })
    })

    expect(mockCallback).toBeCalledTimes(5)
    expect(result.current.isPlayingLoop).toEqual(false)

    await act(async () => {
      result.current.startLoop()
    })

    MockDate.set(10900)
    await act(async () => {
      mockedRaf.step({ count: 5, time: 101 })
    })

    expect(mockCallback).toBeCalledTimes(10)
    expect(result.current.isPlayingLoop).toEqual(true)

    unmount()

    await act(async () => {
      mockedRaf.step({ count: 5, time: 101 })
    })

    expect(mockCallback).toBeCalledTimes(10)
    expect(result.current.isPlayingLoop).toEqual(true)
  })

  it("should call passed function at passed speed", async () => {
    const mockedRaf = createMockRaf()
    requestAnimationMock.mockImplementation(mockedRaf.raf)
    cancelAnimationFrameMock.mockImplementation(mockedRaf.cancel)

    const mockCallback = vi.fn()

    renderHook(() => useGameLoop({ logicToLoop: mockCallback, speed: 500 }))

    await act(async () => {
      mockedRaf.step({ count: 6, time: 255 })
    })

    expect(mockCallback).toBeCalledTimes(3)
  })

  it("should return secondsPassed", async () => {
    const mockedRaf = createMockRaf()
    requestAnimationMock.mockImplementation(mockedRaf.raf)
    cancelAnimationFrameMock.mockImplementation(mockedRaf.cancel)

    const mockCallback = vi.fn()

    const mockStartTime = 10000
    MockDate.set(mockStartTime)

    const { result } = renderHook(() =>
      useGameLoop({ logicToLoop: mockCallback, speed: 1000 })
    )

    await act(async () => {
      mockedRaf.step({ count: 20, time: 501 })
      MockDate.set(mockedRaf.now() + mockStartTime)
      mockedRaf.step({ count: 1, time: 1 })
    })

    expect(result.current.secondsPassed).toEqual(10)
  })

  it("should cancelAnimationFrame on unmount", async () => {
    const mockedRaf = createMockRaf()
    requestAnimationMock.mockImplementation(mockedRaf.raf)
    cancelAnimationFrameMock.mockImplementation(mockedRaf.cancel)

    const mockCallback = vi.fn()
    const mockStartTime = 10000
    MockDate.set(mockStartTime)

    const { unmount } = renderHook(() =>
      useGameLoop({ logicToLoop: mockCallback, speed: 500 })
    )
    expect(cancelAnimationFrameMock).toBeCalledTimes(1)

    expect(mockCallback).toBeCalledTimes(0)

    act(() => {
      mockedRaf.step({ count: 2, time: 501 })
    })

    expect(mockCallback).toBeCalledTimes(2)

    unmount()

    expect(cancelAnimationFrameMock).toBeCalledTimes(2)

    await act(async () => {
      mockedRaf.step({ count: 10, time: 501 })
    })

    expect(mockCallback).toBeCalledTimes(2)
  })
})
