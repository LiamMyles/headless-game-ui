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

      if (currentTiming - lastRunTiming > speed) {
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
    }

    if (playLoop) {
      requestAnimationFrame((newCurrentTiming) => {
        gameLoop(newCurrentTiming, newCurrentTiming, playLoop)
      })
    }

    return () => {
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
