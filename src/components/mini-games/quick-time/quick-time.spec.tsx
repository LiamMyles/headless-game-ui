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
    })
  })
})
