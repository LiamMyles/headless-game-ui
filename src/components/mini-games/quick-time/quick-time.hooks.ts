import { type Reducer, useReducer, useEffect, useState } from "react"
import { useTimer } from "../../supporting/timer"
import { randomShuffleSeed } from "./quick-time.utility"

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
  | { type: "fail" }
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
    case "fail": {
      return {
        ...state,
        gameState: "FAIL",
      }
    }
    default: {
      return state
    }
  }
}

interface useQuickTimeLogicReturn {
  quickTimeState: QuickTimeState
  timeLeft: number
}

export function useQuickTimeLogic(): useQuickTimeLogicReturn {
  const [isRunning, setIsRunning] = useState(true)
  const [state, dispatch] = useReducer(quickTimeReducer, initialState)
  const { isFinished, timeLeft, reset } = useTimer({
    durationSeconds: 3,
    isRunning,
  })
  const currentGameState = state.gameState

  useEffect(() => {
    if (isFinished) {
      dispatch({ type: "fail" })
    }
  }, [isFinished])

  useEffect(() => {
    function downHandler({ key }: KeyboardEvent) {
      switch (key) {
        case "Enter": {
          dispatch({ type: "reset" })
          dispatch({
            type: "shuffle",
            payload: randomShuffleSeed(),
          })
          setIsRunning(true)
          reset()
          break
        }
        default: {
          if (currentGameState === "PLAYING") {
            dispatch({ payload: key, type: "input" })
          }
        }
      }
    }

    window.addEventListener("keydown", downHandler)

    return () => {
      window.removeEventListener("keydown", downHandler)
    }
  }, [currentGameState, reset])

  useEffect(() => {
    if (currentGameState === "PASS") {
      setIsRunning(false)
    }
  }, [currentGameState, reset])

  return { quickTimeState: state, timeLeft }
}
