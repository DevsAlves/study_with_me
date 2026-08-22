import './style/App.css'
import Side from './components/Side'
import Tasks from './components/Tasks'
import Projects from './components/Projects'
import Clock from './components/Clock'
import Sleep from './components/Sleep'
function App() {
  return (
    <>
      <Tasks/>
      <Side/>
      <Clock/>
      <Sleep/>
      <Projects/>
    </>
  )
}

export default App
