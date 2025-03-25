import confetti from "canvas-confetti"

export function fireworkConfetti() {
  const scalar = 3
  const duration = 2 * 1000
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
