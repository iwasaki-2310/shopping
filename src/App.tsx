import { useState } from 'react'
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
      <div>
        <p></p>
      </div>
    </>
  )
}

export default App
