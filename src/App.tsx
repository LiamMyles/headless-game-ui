import "./App.css"
import { QuickTime } from "./components/mini-games/quick-time"
import { Timer } from "./components/supporting/timer"

function App() {
  return (
    <div>
      <Timer />
      <QuickTime />
    </div>
  )
}

export default App
