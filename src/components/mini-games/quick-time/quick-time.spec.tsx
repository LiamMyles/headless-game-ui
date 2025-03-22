import { describe, it, expect } from "vitest"

import {
  quickTimeReducer,
  type QuickTimeActions,
  type QuickTimeState,
} from "./quick-time.hooks"

describe("Quick Time Component", () => {
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
    })
    describe("User Interaction", () => {
      it.todo("should capture all keyboard input while gameState is PLAYING")
      it.todo("should trigger a fail when timer expires")
      it.todo("should pause timer on success")
      it.todo('should favour user successful input over time on collision')
      it.todo("should reset and shuffle when Enter is pressed")
    })
  })
})
