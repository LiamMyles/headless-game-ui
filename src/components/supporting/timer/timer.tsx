import { useTimer } from "./timer.hook"

export function Timer() {
  const { isFinished, timeLeft } = useTimer({ seconds: 5 })
  return (
    <>
      {isFinished && "🎉"}
      {timeLeft}
      <label htmlFor="progress-bar">Timer</label>
      <br />
      <progress id="progress-bar" value="70" max="100" />
    </>
  )
}
