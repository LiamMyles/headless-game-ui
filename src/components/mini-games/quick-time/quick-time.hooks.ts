import { type Reducer, useReducer, useEffect } from "react"

type QuickTimeGameStates = "FAIL" | "PASS" | "PLAYING"

export interface QuickTimeState {
  sequenceToMatch: string[]
  inputSequence: string[]
  gameState: QuickTimeGameStates
}

const initialState: QuickTimeState = {
  sequenceToMatch: ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"],
  inputSequence: [],
  gameState: "PLAYING",
}

export type QuickTimeActions =
  | { type: "input"; payload: string }
  | { type: "reset" }

export const quickTimeReducer: Reducer<QuickTimeState, QuickTimeActions> = (
  state,
  action
) => {
  switch (action.type) {
    case "input": {
      if (state.gameState !== "PLAYING") {
        return { ...state }
      }

      let newGameState: QuickTimeGameStates = "PLAYING"
      const newInputSequence = [...state.inputSequence, action.payload]

      if (newInputSequence.length === state.sequenceToMatch.length) {
        newGameState = "PASS"
      }

      newInputSequence.forEach((input, index) => {
        if (input !== state.sequenceToMatch[index]) {
          newGameState = "FAIL"
        }
      })

      return {
        ...state,
        inputSequence: newInputSequence,
        gameState: newGameState,
      }
    }
    case "reset":
      return { ...state, inputSequence: [], gameState: "PLAYING" }
  }
}

export function useQuickTimeLogic(): QuickTimeState {
  const [state, dispatch] = useReducer(quickTimeReducer, initialState)

  useEffect(() => {
    function downHandler({ key }: KeyboardEvent) {
      switch (key) {
        case "Enter": {
          dispatch({ type: "reset" })
          break
        }
        default: {
          dispatch({ payload: key, type: "input" })
          break
        }
      }
    }

    window.addEventListener("keydown", downHandler)

    return () => {
      window.removeEventListener("keydown", downHandler)
    }
  }, [])
  return state
}
