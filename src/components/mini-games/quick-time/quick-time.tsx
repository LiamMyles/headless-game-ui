import { useEffect } from "react"
import { useQuickTimeLogic } from "./quick-time.hooks"
import { fireworkConfetti } from "../../../confetti"

export function QuickTime(): React.ReactNode {
  const { quickTimeState, timeLeft } = useQuickTimeLogic()
  const currentGameState = quickTimeState.gameState
  useEffect(() => {
    if (currentGameState === "PASS") {
      fireworkConfetti()
    }
  }, [currentGameState])

  return (
    <div>
      <div>
        <h1 className="m-auto mb-2 w-max text-4xl font-bold">
          Quick Time Game
        </h1>
        <div className="mb-4">
          {quickTimeState.gameState === "PLAYING" && (
            <h2 className="m-auto my-2 block w-max rounded-2xl border border-slate-800 bg-white p-1 font-bold text-slate-700">
              PLAYING
            </h2>
          )}
          {quickTimeState.gameState === "FAIL" && (
            <h2 className="m-auto my-2 block w-max rounded-2xl border border-slate-800 bg-white p-1 font-bold text-rose-700">
              YOU FAIL
            </h2>
          )}
          {quickTimeState.gameState === "PASS" && (
            <h2 className="m-auto my-2 block w-max rounded-2xl border border-slate-800 bg-white p-1 font-bold text-green-700">
              YOU WIN!
            </h2>
          )}
        </div>
        <ul className="m-auto flex w-min list-none gap-2">
          {quickTimeState.sequenceToMatch.map((key, index) => {
            const currentInput = quickTimeState.inputSequence[index]
            const previousInput = quickTimeState.inputSequence[index - 1]
            let isActive = false

            if (index === 0 && currentInput === undefined) {
              isActive = true
            } else if (
              currentInput === undefined &&
              previousInput !== undefined
            ) {
              isActive = true
            }

            return (
              <QuickTimeKey
                isActiveKey={isActive}
                inputKey={currentInput}
                expectedKey={key}
                key={key}
              />
            )
          })}
        </ul>

        <div className="m-auto mt-4 flex w-min flex-col items-center gap-2">
          <label htmlFor="progress-bar">Timer</label>
          <progress
            className="[&::-moz-progress-bar]:bg-violet-400 [&::-webkit-progress-bar]:overflow-hidden [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-violet-400 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-100 [&::-webkit-progress-value]:ease-in"
            id="progress-bar"
            value={timeLeft}
            max={3000}
          />
        </div>
      </div>
    </div>
  )
}

interface QuickTimeKeyProps {
  inputKey: string | undefined
  expectedKey: string
  isActiveKey: boolean
}
function QuickTimeKey({
  inputKey,
  expectedKey,
  isActiveKey,
}: QuickTimeKeyProps): React.ReactNode {
  if (isActiveKey)
    return (
      <li>
        <div
          className="rounded-md border border-blue-200 p-1 font-bold text-blue-800"
          role="img"
          aria-label={`current key ${expectedKey}`}
        >
          {expectedKey}
        </div>
      </li>
    )
  if (inputKey === expectedKey) {
    return (
      <li>
        <div
          className="rounded-md border border-green-200 p-1 text-green-800"
          role="img"
          aria-label={`successful key ${expectedKey}`}
        >
          {expectedKey}
        </div>
      </li>
    )
  } else if (inputKey !== undefined && expectedKey !== inputKey) {
    return (
      <li>
        <div
          className="rounded-md border border-red-200 p-1 text-red-800"
          role="img"
          aria-label={`failed on key ${expectedKey}`}
        >
          {expectedKey}
        </div>
      </li>
    )
  } else {
    return (
      <li>
        <div
          className="rounded-md border border-slate-200 p-1 text-slate-800"
          role="img"
          aria-label={`upcoming key ${expectedKey}`}
        >
          {expectedKey}
        </div>
      </li>
    )
  }
}
