import { useEffect, useRef, useState } from "react"

interface UseGameLoop {
  logicToLoop: () => void
  speed: number
}

export const useGameLoop = ({ logicToLoop, speed }: UseGameLoop) => {
  const [secondsPassed, setSecondsPassed] = useState(0)
  const [playLoop, setPlayLoop] = useState(true)
  const requestedAnimationId = useRef(0)
  const startTime = useRef(0)
  const isInitialRun = useRef(true)

  useEffect(() => {
    startTime.current = Date.now()

    const gameLoop = (
      currentTiming: number,
      lastRunTiming: number,
      playNextLoop: boolean
    ) => {
      const secondsPassed = Math.round(
        Math.abs(startTime.current - Date.now()) / 1000
      )
      setSecondsPassed(secondsPassed)

      let newLastRunTiming = lastRunTiming

      if (
        currentTiming - lastRunTiming > speed ||
        isInitialRun.current === true
      ) {
        logicToLoop()
        newLastRunTiming = currentTiming
      }

      if (playNextLoop) {
        requestedAnimationId.current = requestAnimationFrame(
          (newCurrentTiming) => {
            gameLoop(newCurrentTiming, newLastRunTiming, playNextLoop)
          }
        )
      }

      if (isInitialRun.current === true) {
        isInitialRun.current = false
      }
    }

    if (playLoop) {
      requestedAnimationId.current = requestAnimationFrame(
        (newCurrentTiming) => {
          gameLoop(newCurrentTiming, newCurrentTiming, playLoop)
        }
      )
    }

    return () => {
      isInitialRun.current = true
      cancelAnimationFrame(requestedAnimationId.current)
    }
  }, [logicToLoop, speed, playLoop])

  const stopLoop = () => {
    cancelAnimationFrame(requestedAnimationId.current)
    setPlayLoop(false)
  }

  const startLoop = () => {
    setPlayLoop(true)
  }

  return { secondsPassed, stopLoop, startLoop, isPlayingLoop: playLoop }
}
