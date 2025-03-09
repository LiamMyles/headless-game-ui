import { useState } from "react"
import { useTimer } from "./timer.hook"

export function Timer() {
  const [state, setState] = useState(true)
  const { isFinished, timeLeft } = useTimer({
    durationSeconds: 5,
    isRunning: state,
  })
  return (
    <>
      {isFinished && "🎉"}
      {timeLeft}
      <button
        onClick={() => {
          setState(!state)
        }}
      >
        Start/Stop
      </button>
      <label htmlFor="progress-bar">Timer</label>
      <br />
      <progress id="progress-bar" value="70" max="100" />
    </>
  )
}
