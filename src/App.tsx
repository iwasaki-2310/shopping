import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState<number>(0)

  const counterIncrement = () => {
    setCount(count + 1)
  }

  return (
    <>
    <button onClick={counterIncrement}>カウントアップ</button>
    <p>{count}</p>
    </>
  )
}

export default App
