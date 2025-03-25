import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"

import { renderHook, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"

import {
  quickTimeReducer,
  useQuickTimeLogic,
  type QuickTimeState,
  type QuickTimeActions,
} from "./quick-time.hooks"
import { getMockedRaf } from "../../../test-helpers/get-mocked-raf"

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

describe("Quick Time Logic", () => {
  describe("useQuickTimeLogic", () => {
    describe("Reducer", () => {
      describe("Input Action", () => {
        it("should update with new keyboard input", () => {
          const state: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: [],
            gameState: "PLAYING",
          }

          const action: QuickTimeActions = {
            payload: "ArrowDown",
            type: "input",
          }

          const results = quickTimeReducer(state, action)

          expect(results.inputSequence).toEqual(["ArrowDown"])
        })
        it("should change gameState to FAIL on first input mismatch", () => {
          const state: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: [],
            gameState: "PLAYING",
          }

          const action: QuickTimeActions = {
            payload: "ArrowUp",
            type: "input",
          }

          const results = quickTimeReducer(state, action)

          expect(results.gameState).toEqual("FAIL")
        })
        it.each`
          initialInputSequence                      | nextInput
          ${["ArrowDown"]}                          | ${"ArrowDown"}
          ${["ArrowDown", "ArrowUp"]}               | ${"ArrowDown"}
          ${["ArrowDown", "ArrowUp", "ArrowRight"]} | ${"ArrowUp"}
        `(
          "should fail with when current input is $initialInputSequence and $nextInput is passed",
          ({ initialInputSequence, nextInput }) => {
            const state: QuickTimeState = {
              sequenceToMatch: [
                "ArrowDown",
                "ArrowUp",
                "ArrowRight",
                "ArrowLeft",
              ],
              inputSequence: initialInputSequence,
              gameState: "PLAYING",
            }

            const action: QuickTimeActions = {
              payload: nextInput,
              type: "input",
            }

            const results = quickTimeReducer(state, action)

            expect(results.gameState).toEqual("FAIL")
          }
        )
        it("should change gameState to PASS when all inputs match", () => {
          const state: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: ["ArrowDown", "ArrowUp", "ArrowRight"],
            gameState: "PLAYING",
          }

          const action: QuickTimeActions = {
            payload: "ArrowLeft",
            type: "input",
          }

          const results = quickTimeReducer(state, action)

          expect(results.gameState).toEqual("PASS")
        })
        it("should not update inputs if gameState is PASS", () => {
          const state: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"],
            gameState: "PASS",
          }

          const action: QuickTimeActions = {
            payload: "ArrowLeft",
            type: "input",
          }

          const results = quickTimeReducer(state, action)

          expect(results.inputSequence).toEqual(state.inputSequence)
        })
        it("should not update inputs if gameState is FAIL", () => {
          const state: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: ["ArrowDown", "ArrowUp", "ArrowLeft"],
            gameState: "FAIL",
          }

          const action: QuickTimeActions = {
            payload: "ArrowLeft",
            type: "input",
          }

          const results = quickTimeReducer(state, action)

          expect(results.inputSequence).toEqual(state.inputSequence)
        })
      })
      describe("Reset Action", () => {
        it("should reset state to defaults", () => {
          const inProgressState: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: ["ArrowDown", "ArrowUp", "ArrowRight"],
            gameState: "PLAYING",
          }

          const action: QuickTimeActions = {
            type: "reset",
          }

          const results = quickTimeReducer(inProgressState, action)

          const expectedDefaultState: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: [],
            gameState: "PLAYING",
          }

          expect(results).toEqual(expectedDefaultState)
        })
      })
      describe("Shuffle Action", () => {
        it("should shuffle based on seed", () => {
          const inProgressState: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: [],
            gameState: "PLAYING",
          }

          const action: QuickTimeActions = {
            type: "shuffle",
            payload: 42,
          }

          const results = quickTimeReducer(inProgressState, action)

          const expectedShuffleResults = [
            "ArrowUp",
            "ArrowRight",
            "ArrowDown",
            "ArrowLeft",
          ]

          expect(results.sequenceToMatch).toEqual(expectedShuffleResults)
        })
      })
      describe("Fail Action", () => {
        it("should trigger a fail state when called", () => {
          const initialSate: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: [],
            gameState: "PLAYING",
          }

          const action: QuickTimeActions = {
            type: "fail",
          }

          const results = quickTimeReducer(initialSate, action)

          const expectedFailState: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: [],
            gameState: "FAIL",
          }

          expect(results.gameState).toEqual("FAIL")
          expect(results).toEqual(expectedFailState)
        })
      })
      describe("Faulty Action", () => {
        it("should return existing state", () => {
          const initialSate: QuickTimeState = {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: [],
            gameState: "PLAYING",
          }

          const action = {
            type: "apples",
          }

          //@ts-expect-error asserting impossible case is handled
          const results = quickTimeReducer(initialSate, action)

          expect(results).not.toBeUndefined()
        })
      })
    })
    describe("Hook", () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })
      it("should capture successful user input sequence", async () => {
        getMockedRaf()

        const { result } = renderHook(() => useQuickTimeLogic())

        expect(result.current.quickTimeState.gameState).toEqual("PLAYING")

        const inputPromises = result.current.quickTimeState.sequenceToMatch.map(
          (input) => {
            return userEvent.keyboard(`{${input}}`)
          }
        )

        await Promise.allSettled(inputPromises)

        expect(result.current.quickTimeState.gameState).toEqual("PASS")
      })
      it("should trigger a fail when timer expires", async () => {
        const mockedRaf = getMockedRaf()

        const { result } = renderHook(() => useQuickTimeLogic())

        mockedRaf.step({ count: 20, time: 100 })
        vi.advanceTimersByTime(2000)

        await waitFor(() => {
          expect(result.current.quickTimeState.gameState).toEqual("PLAYING")
          expect(result.current.timeLeft).toEqual(1000)
        })

        mockedRaf.step({ count: 10, time: 100 })
        vi.advanceTimersByTime(1000)

        await waitFor(() => {
          expect(result.current.quickTimeState.gameState).toEqual("FAIL")
          expect(result.current.timeLeft).toEqual(0)
        })
      })
      it("should pause timer on success", async () => {
        const mockedRaf = getMockedRaf()

        const { result } = renderHook(() => useQuickTimeLogic())

        expect(result.current.quickTimeState.gameState).toEqual("PLAYING")

        mockedRaf.step({ count: 20, time: 100 })
        vi.advanceTimersByTime(2000)

        await waitFor(() => {
          expect(result.current.timeLeft).toEqual(1000)
          expect(result.current.quickTimeState.gameState).toEqual("PLAYING")
        })

        const inputPromises = result.current.quickTimeState.sequenceToMatch.map(
          (input) => {
            return userEvent.keyboard(`{${input}}`)
          }
        )

        await Promise.allSettled(inputPromises)

        mockedRaf.step({ count: 20, time: 100 })
        vi.advanceTimersByTime(2000)

        await waitFor(() => {
          expect(result.current.timeLeft).toEqual(1000)
          expect(result.current.quickTimeState.gameState).toEqual("PASS")
        })
      })
      it("should reset and shuffle when Enter is pressed", async () => {
        const mockedRaf = getMockedRaf()

        const { result } = renderHook(() => useQuickTimeLogic())

        expect(result.current.quickTimeState.gameState).toEqual("PLAYING")

        mockedRaf.step({ count: 20, time: 100 })
        vi.advanceTimersByTime(2000)

        await waitFor(() => {
          expect(result.current.timeLeft).toEqual(1000)
          expect(result.current.quickTimeState.gameState).toEqual("PLAYING")
        })

        const partialUserInputPromises =
          result.current.quickTimeState.sequenceToMatch
            .slice(0, 3)
            .map((input) => {
              return userEvent.keyboard(`{${input}}`)
            })

        await Promise.allSettled(partialUserInputPromises)

        expect(result.current).toEqual({
          quickTimeState: {
            sequenceToMatch: [
              "ArrowDown",
              "ArrowUp",
              "ArrowRight",
              "ArrowLeft",
            ],
            inputSequence: ["ArrowDown", "ArrowUp", "ArrowRight"],
            gameState: "PLAYING",
          },
          timeLeft: 1000,
        })

        await userEvent.keyboard("{Enter}")

        expect(result.current).toEqual({
          quickTimeState: {
            sequenceToMatch: [
              "ArrowUp",
              "ArrowRight",
              "ArrowDown",
              "ArrowLeft",
            ],
            inputSequence: [],
            gameState: "PLAYING",
          },
          timeLeft: 3000,
        })
      })
    })
  })
})
