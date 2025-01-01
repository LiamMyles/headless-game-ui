import { useQuickTimeLogic } from "./quick-time.hooks"

export function QuickTime() {
  const quickTimeState = useQuickTimeLogic()
  return (
    <div>
      <h1>Quick Time Game:</h1>
      <h2>{quickTimeState.gameState}</h2>
      <p>{quickTimeState.sequenceToMatch.map((key) => `${key} ,`)}</p>
      <p>{quickTimeState.inputSequence.map((key) => `${key} ,`)}</p>
    </div>
  )
}
