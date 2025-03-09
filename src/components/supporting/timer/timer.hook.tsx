import { useCallback, useEffect, useRef, useState } from "react"

interface useTimerProps {
  durationSeconds: number
  isRunning?: boolean
}

interface useTimerReturn {
  isFinished: boolean
  timeLeft: number
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

  const timerCheck = useCallback(
    (nowTimeMs: DOMHighResTimeStamp, firstRun: boolean) => {
      if (firstRun) {
        timeMsSinceLastUpdate.current = performance.now()
      }
      const elapsedTime = nowTimeMs - timeMsSinceLastUpdate.current

      const shouldUpdateTimer = nowTimeMs >= timeMsSinceLastUpdate.current + 500

      if (shouldUpdateTimer) {
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

  useEffect(() => {
    if (isRunning) {
      timerCheck(performance.now(), true)
    }

    return () => {
      cancelAnimationFrame(requestedAnimationId.current)
      timeMsSinceLastUpdate.current = 0
    }
  }, [isRunning, timerCheck])

  return { isFinished: timerFinished, timeLeft: timeLeft }
}
