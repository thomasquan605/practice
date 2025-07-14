import { useState } from 'react'
import Drag from './Drag.jsx'

import './App.css'

function App() {

  return (
    <div>
      <Drag 
        onStartRequest={(event) => {
          setTimeout(() => {
            event.target.springBack()
          }, 5000);
        }} 
      />
    </div>
  )
}

export default App
