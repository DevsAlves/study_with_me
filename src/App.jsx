import './style/App.css'
import Side from './components/Side'
import Tasks from './components/Tasks'
import Projects from './components/Projects'
import Pomodoro from './components/Pomodoro'
import Sleep from './components/Sleep'
import Timer from './components/Timer'
function App() {
  return (
    <>
      <Tasks/>
      <Side/>
      <Pomodoro/>
      <Timer/>
      <Sleep/>
      <Projects/>
    </>
  )
}

export default App
