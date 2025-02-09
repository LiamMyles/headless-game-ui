import { useEffect, useRef, useState } from "react"

interface useTimerProps {
  seconds: number
  isRunning?: boolean
}

interface useTimerReturn {
  isFinished: boolean
  timeLeft: number
}

export function useTimer({
  seconds,
  isRunning = true,
}: useTimerProps): useTimerReturn {
  const [timerFinished, setTimerFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(seconds * 1000)
  const requestedAnimationId = useRef(0)
  const timerStartTime = useRef<DOMHighResTimeStamp | null>(null)
  const timeSinceLastUpdate = useRef<DOMHighResTimeStamp>(0)

  useEffect(() => {
    function timerCheck(lastTime: DOMHighResTimeStamp) {
      if (lastTime >= timeSinceLastUpdate.current + 500) {
        timeSinceLastUpdate.current = lastTime
        const sum = Math.max(0, Math.round(1000 * seconds - lastTime))
        setTimeLeft(sum)
      }

      if (
        timerStartTime.current !== null &&
        lastTime >= timerStartTime.current + 1000 * seconds
      ) {
        setTimerFinished(true)
      } else {
        requestedAnimationId.current = requestAnimationFrame((now) => {
          timerCheck(now)
        })
      }
    }

    if (timerStartTime.current === null && isRunning === true) {
      timerStartTime.current = performance.now()
      timerCheck(performance.now())
    }
    return () => {
      cancelAnimationFrame(requestedAnimationId.current)
      timerStartTime.current = null
      timeSinceLastUpdate.current = 0
    }
  }, [seconds, isRunning])

  return { isFinished: timerFinished, timeLeft: timeLeft }
}
