import { useEffect } from "react"
import { useQuickTimeLogic } from "./quick-time.hooks"
import confetti from "canvas-confetti"

export function QuickTime() {
  const { quickTimeState, timeLeft } = useQuickTimeLogic()
  const currentGameState = quickTimeState.gameState
  useEffect(() => {
    if (currentGameState === "PASS") {
      confetti()
    }
  }, [currentGameState])

  return (
    <div>
      <div>
        <h1>Quick Time Game:</h1>
        {quickTimeState.gameState === "FAIL" && (
          <h2 className="font-bold text-rose-700 bg-white block w-max m-auto p-1 my-2 rounded-2xl">
            YOU FAIL
          </h2>
        )}
        <p>{quickTimeState.sequenceToMatch.map((key) => `${key} ,`)}</p>
        {quickTimeState.inputSequence.length === 0 ? (
          <p>Waiting</p>
        ) : (
          <p>{quickTimeState.inputSequence.map((key) => `${key} ,`)}</p>
        )}
        <div className="mt-4">
          <label htmlFor="progress-bar">Timer</label>
          <br />
          <progress
            className="transition ease-in "
            id="progress-bar"
            value={timeLeft}
            max={3000}
          />
        </div>
      </div>
    </div>
  )
}
