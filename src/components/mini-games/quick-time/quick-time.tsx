import { useEffect } from "react"
import { useQuickTimeLogic } from "./quick-time.hooks"
import confetti from "canvas-confetti"

function fireworkConfetti() {
  const scalar = 3
  const duration = 15 * 1000
  const animationEnd = Date.now() + duration
  const unicorn = confetti.shapeFromText({ text: "🦄", scalar })
  const cat = confetti.shapeFromText({ text: "😸", scalar })
  const defaults = { startVelocity: 30, spread: 360, ticks: 120, zIndex: 0 }

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      shapes: [unicorn, cat],
      scalar,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    })
    confetti({
      ...defaults,
      particleCount,
      scalar,
      shapes: [unicorn, cat],
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    })
  }, 250)
}

export function QuickTime() {
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
