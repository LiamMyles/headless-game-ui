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
        <h1 className="text-4xl font-bold w-max m-auto mb-2">
          Quick Time Game
        </h1>
        <div className="mb-4">
          {quickTimeState.gameState === "PLAYING" && (
            <h2 className="font-bold text-slate-700 bg-white border border-slate-800 block w-max m-auto p-1 my-2 rounded-2xl">
              PLAYING
            </h2>
          )}
          {quickTimeState.gameState === "FAIL" && (
            <h2 className="font-bold text-rose-700 bg-white border border-slate-800 block w-max m-auto p-1 my-2 rounded-2xl">
              YOU FAIL
            </h2>
          )}
          {quickTimeState.gameState === "PASS" && (
            <h2 className="font-bold text-green-700 bg-white border border-slate-800 block w-max m-auto p-1 my-2 rounded-2xl">
              YOU WIN!
            </h2>
          )}
        </div>
        <ul className="list-none flex gap-2 m-auto w-min">
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

        <div className="mt-4 m-auto w-min flex items-center flex-col gap-2">
          <label htmlFor="progress-bar">Timer</label>
          <progress
            className="[&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:bg-violet-400 [&::-moz-progress-bar]:bg-violet-400 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-100 [&::-webkit-progress-value]:ease-in [&::-webkit-progress-bar]:overflow-hidden"
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
          className="text-blue-800 border border-blue-200 p-1 rounded-md font-bold"
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
          className="text-green-800 border border-green-200 p-1 rounded-md"
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
          className="text-red-800 border border-red-200 p-1 rounded-md"
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
          className="text-slate-800 border border-slate-200 p-1 rounded-md"
          role="img"
          aria-label={`upcoming key ${expectedKey}`}
        >
          {expectedKey}
        </div>
      </li>
    )
  }
}
