import { useCallback, useEffect, useRef, useState } from "react"

interface useTimerProps {
  durationSeconds: number
  isRunning?: boolean
}

interface useTimerReturn {
  isFinished: boolean
  timeLeft: DOMHighResTimeStamp
  reset: () => void
}

export function useTimer({
  durationSeconds,
  isRunning = true,
}: useTimerProps): useTimerReturn {
  const [timerFinished, setTimerFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(durationSeconds * 1000)

  const requestedAnimationId = useRef(0)
  const timeMsSinceLastUpdate = useRef<DOMHighResTimeStamp>(0)
  const totalElapsedTimeMs = useRef<DOMHighResTimeStamp>(0)
  const durationMs = 1000 * durationSeconds
  const lastCapturedSeconds = useRef(durationSeconds)

  const timerCheck = useCallback(
    (nowTimeMs: DOMHighResTimeStamp, firstRun: boolean) => {
      if (firstRun) {
        timeMsSinceLastUpdate.current = performance.now()
      }
      const elapsedTime = nowTimeMs - timeMsSinceLastUpdate.current

      if (elapsedTime >= 500) {
        totalElapsedTimeMs.current = elapsedTime + totalElapsedTimeMs.current
        timeMsSinceLastUpdate.current = nowTimeMs
        const sum = Math.max(
          0,
          Math.round(durationMs - totalElapsedTimeMs.current)
        )

        setTimeLeft(sum)

        if (totalElapsedTimeMs.current >= durationMs) {
          setTimerFinished(true)
        }
      }

      if (totalElapsedTimeMs.current <= durationMs) {
        requestedAnimationId.current = requestAnimationFrame((now) => {
          timerCheck(now, false)
        })
      }
    },
    [durationMs]
  )

  /**
   * Update relevant values when durationSeconds changes.
   */
  useEffect(() => {
    if (lastCapturedSeconds.current !== durationSeconds) {
      totalElapsedTimeMs.current = 0
      setTimeLeft(durationMs)
    } else {
      lastCapturedSeconds.current = durationSeconds
    }
  }, [durationMs, durationSeconds])

  /**
   * Update based on isRunning
   */
  useEffect(() => {
    if (isRunning) {
      timerCheck(performance.now(), true)
    }

    return () => {
      cancelAnimationFrame(requestedAnimationId.current)
      timeMsSinceLastUpdate.current = 0
    }
  }, [isRunning, timerCheck])

  function reset() {
    setTimeLeft(durationSeconds * 1000)
    setTimerFinished(false)
    cancelAnimationFrame(requestedAnimationId.current)
    totalElapsedTimeMs.current = 0
    if (isRunning) {
      timerCheck(performance.now(), true)
    }
  }

  return { isFinished: timerFinished, timeLeft, reset }
}
