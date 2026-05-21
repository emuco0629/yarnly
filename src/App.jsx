import { useState } from 'react'
import OpeningScene from './components/opening/OpeningScene'
import WalkingScene from './components/scenes/WalkingScene'
import './index.css'

// scene: 'opening' | 'walking' | 'room'
export default function App() {
  const [scene, setScene] = useState('opening')
  const [userColor, setUserColor] = useState(null)

  function handleOpeningComplete(color) {
    setUserColor(color)
    setScene('walking')
  }

  function handleHome() {
    setScene('opening')
    setUserColor(null)
  }

  if (scene === 'opening') {
    return <OpeningScene onComplete={handleOpeningComplete} />
  }

  if (scene === 'walking') {
    return <WalkingScene color={userColor} onHome={handleHome} />
  }

  return null
}
