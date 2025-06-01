import { createContext, Fragment, useContext, useEffect, type ReactNode } from "react"
import {
  useQuickTimeLogic,
  type QuickTimeGameStates,
  type useQuickTimeLogicReturn,
} from "./quick-time.hooks"
import { fireworkConfetti } from "../../../confetti"

interface QuickTimeContainerProps {
  children: ReactNode
  onWin: () => void
}

const QuickTimeGameState = createContext<null | useQuickTimeLogicReturn["quickTimeState"]>(null)
const QuickTimeTimeLeft = createContext<null | useQuickTimeLogicReturn["timeLeft"]>(null)

function QuickTimeContainer({ children, onWin }: QuickTimeContainerProps): ReactNode {
  const { quickTimeState, timeLeft } = useQuickTimeLogic()

  const currentGameState = quickTimeState.gameState
  useEffect(() => {
    if (currentGameState === "PASS") {
      onWin()
    }
  }, [currentGameState, onWin])

  return (
    <QuickTimeGameState.Provider value={quickTimeState}>
      <QuickTimeTimeLeft.Provider value={timeLeft}>{children}</QuickTimeTimeLeft.Provider>
    </QuickTimeGameState.Provider>
  )
}

type keyState = "TARGET" | "CORRECT" | "FAILED" | "UPCOMING"

interface QuickTimeIndicatorsProps {
  renderIndicator: (value: { keyState: keyState; key: string }) => ReactNode
}

function QuickTimeIndicators({ renderIndicator }: QuickTimeIndicatorsProps): ReactNode {
  const quickTimeState = useContext(QuickTimeGameState)
  if (quickTimeState === null) {
    return "Missing state"
  }

  const items = quickTimeState.sequenceToMatch.map((thisKey, index) => {
    const currentInput = quickTimeState.inputSequence[index]
    const previousInput = quickTimeState.inputSequence[index - 1]

    let isActive = false
    if (index === 0 && currentInput === undefined) {
      isActive = true
    } else if (currentInput === undefined && previousInput !== undefined) {
      isActive = true
    }

    let keyState: keyState
    if (isActive) {
      keyState = "TARGET"
    } else if (currentInput === thisKey) {
      keyState = "CORRECT"
    } else if (currentInput !== undefined && thisKey !== currentInput) {
      keyState = "FAILED"
    } else {
      keyState = "UPCOMING"
    }

    return (
      <Fragment key={`${thisKey}-${index}`}>{renderIndicator({ keyState, key: thisKey })}</Fragment>
    )
  })

  return items.map((item) => item)
}

function QuickTimeTimer({ ...rest }: React.ProgressHTMLAttributes<HTMLProgressElement>): ReactNode {
  const timeLeft = useContext(QuickTimeTimeLeft)
  if (timeLeft === null) {
    return "Missing state"
  }
  return <progress {...rest} value={timeLeft} max={3000} />
}

interface QuickTimeGameStateIndicatorProps {
  renderIndicator: (value: { gameState: QuickTimeGameStates }) => ReactNode
}

function QuickTimeGameStateIndicator({ renderIndicator }: QuickTimeGameStateIndicatorProps) {
  const quickTimeState = useContext(QuickTimeGameState)
  if (quickTimeState === null) {
    return "Missing state"
  }

  return renderIndicator({ gameState: quickTimeState.gameState })
}

const indicators: { [k in keyState]: { uniqueClasses: string; label: string } } = {
  TARGET: { uniqueClasses: "font-bold text-blue-800", label: "current key" },
  CORRECT: { uniqueClasses: "text-green-800", label: "successful key" },
  FAILED: { uniqueClasses: "text-red-800", label: "failed on key" },
  UPCOMING: { uniqueClasses: "text-slate-800", label: "upcoming key" },
}

const gameStateIndicators: {
  [k in QuickTimeGameStates]: { uniqueClasses: string; label: string }
} = {
  FAIL: { label: "Game Over", uniqueClasses: "text-rose-700" },
  PASS: { label: "You Win", uniqueClasses: "text-green-700" },
  PLAYING: { label: "Times Ticking", uniqueClasses: "text-slate-700" },
}
export function QuickTime() {
  return (
    <QuickTimeContainer onWin={fireworkConfetti}>
      <div>
        <h1 className="m-auto mb-2 w-max text-4xl font-bold">Quick Time Game</h1>
        <div className="mb-4">
          <div className="mb-4">
            <QuickTimeGameStateIndicator
              renderIndicator={({ gameState }) => {
                return (
                  <h2
                    className={`m-auto my-2 block w-max rounded-2xl border border-slate-800 bg-white p-1 font-bold ${gameStateIndicators[gameState].uniqueClasses}`}
                  >
                    {gameStateIndicators[gameState].label}
                  </h2>
                )
              }}
            />
          </div>
        </div>
        <ul className="m-auto flex w-min list-none gap-2">
          <QuickTimeIndicators
            renderIndicator={({ keyState, key }) => {
              return (
                <li>
                  <div
                    className={`rounded-md border border-blue-200 p-1 ${indicators[keyState].uniqueClasses}`}
                    role="img"
                    aria-label={`${indicators[keyState].label} ${key}`}
                  >
                    {key}
                  </div>
                </li>
              )
            }}
          />
        </ul>
        <div className="m-auto mt-4 flex w-min flex-col items-center gap-2">
          <label htmlFor="progress-bar">Timer</label>
          <QuickTimeTimer
            className="[&::-moz-progress-bar]:bg-violet-400 [&::-webkit-progress-bar]:overflow-hidden [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-slate-300 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-violet-400 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-100 [&::-webkit-progress-value]:ease-in"
            id="progress-bar"
          />
        </div>
      </div>
    </QuickTimeContainer>
  )
}
