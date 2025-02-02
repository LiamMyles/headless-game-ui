import { useEffect } from "react"
import { useQuickTimeLogic } from "./quick-time.hooks"
import confetti from "canvas-confetti"

export function QuickTime() {
  const quickTimeState = useQuickTimeLogic()
  const currentGameState = quickTimeState.gameState
  useEffect(() => {
    if (currentGameState === "PASS") {
      confetti()
    }
  }, [currentGameState])
  return (
    <div>
      <h1>Quick Time Game:</h1>
      <h2>{quickTimeState.gameState}</h2>
      <p>{quickTimeState.sequenceToMatch.map((key) => `${key} ,`)}</p>
      <p>{quickTimeState.inputSequence.map((key) => `${key} ,`)}</p>
    </div>
  )
}
