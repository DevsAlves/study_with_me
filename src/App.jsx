import './style/App.css'
import Hero from './components/Hero'
import Side from './components/Side'
import Tasks from './components/Tasks'
import Projects from './components/Projects'
import Clock from './components/Clock'
function App() {
  return (
    <>
      <Side/>
      <Hero/>
      <Tasks/>
      <Projects/>
      <Clock/>
    </>
  )
}

export default App
