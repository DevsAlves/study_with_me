import './style/App.css'
import Side from './components/Side'
import Tasks from './components/Tasks'
import Projects from './components/Projects'
import Pomodoro from './components/Pomodoro'
import Sleep from './components/Sleep'
function App() {
  return (
    <>
      <Tasks/>
      <Side/>
      <Pomodoro/>
      <Sleep/>
      <Projects/>
    </>
  )
}

export default App
