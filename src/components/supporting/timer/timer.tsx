import { useState } from "react"
import { useTimer } from "./timer.hook"

export function Timer() {
  const [timerLength, setTimerLength] = useState(5)
  const [isRunning, setIsRunning] = useState(true)
  const { isFinished, timeLeft } = useTimer({
    durationSeconds: timerLength,
    isRunning,
  })

  return (
    <>
      {isFinished && "🎉"}

      {timeLeft}
      <button
        onClick={() => {
          setTimerLength(timerLength + 1)
        }}
      >
        Restart
      </button>
      <button
        onClick={() => {
          setIsRunning(!isRunning)
        }}
      >
        Start/Stop
      </button>
      <label htmlFor="progress-bar">Timer</label>
      <br />
      <progress
        className="transition ease-in "
        id="progress-bar"
        value={timeLeft}
        max={timerLength * 1000}
      />
    </>
  )
}
