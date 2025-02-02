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
  | { type: "shuffle"; payload: number }

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
    case "reset": {
      return { ...state, inputSequence: [], gameState: "PLAYING" }
    }
    case "shuffle": {
      // Seeded implementation of the Fisher-Yates Shuffle
      const sequenceToShuffle = [...state.sequenceToMatch]

      let chosenElement
      let chosenIndex
      let currentSeed = action.payload

      for (let i = sequenceToShuffle.length; i; i--) {
        const pseudoRandomNumber = Math.sin(currentSeed) * 10000
        const randomNumber = pseudoRandomNumber - Math.floor(pseudoRandomNumber)

        chosenIndex = Math.floor(randomNumber * i)
        chosenElement = sequenceToShuffle[i - 1]

        sequenceToShuffle[i - 1] = sequenceToShuffle[chosenIndex]
        sequenceToShuffle[chosenIndex] = chosenElement

        currentSeed++
      }

      return {
        ...state,
        sequenceToMatch: sequenceToShuffle,
      }
    }
  }
}

export function useQuickTimeLogic(): QuickTimeState {
  const [state, dispatch] = useReducer(quickTimeReducer, initialState)
  const currentGameState = state.gameState

  useEffect(() => {
    function downHandler({ key }: KeyboardEvent) {
      switch (key) {
        case "Enter": {
          dispatch({ type: "reset" })
          dispatch({
            type: "shuffle",
            payload: Math.floor(Math.random() * 100) + 1,
          })
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

  useEffect(() => {
    if (currentGameState === "PASS") {
      dispatch({ type: "reset" })
      dispatch({
        type: "shuffle",
        payload: Math.floor(Math.random() * 100) + 1,
      })
    }
  }, [currentGameState])
  return state
}
