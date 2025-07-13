import { useState, useRef, useEffect, use } from 'react'
import DragBall from './dragball.js'
import refreshIcon from './assets/refresh.png'

import './Drag.css'

export default function Drag() {
  const containerId = 'area'
  const draggerId = 'sample'

  useEffect(() => {
    const dragBall = new DragBall({
      containerId,
      draggerId
    }, () => {
      console.log('Drag started')
    }, () => {
      console.log('Drag ended')
    }, (y) => {
      console.log(`Dragging at: ${y}`)
    })

    setTimeout(() => {
      dragBall.springBack()
    }, 5000);

    return () => {
      dragBall.deinit()
    }
  }, [])

  return (
    <div className='container'>
      <div className="area" id={containerId}>
        <div 
          className="sample" 
          id={draggerId}
        >
          <img src={refreshIcon} width="25px" height="25px" />
        </div>
      </div>
    </div>
  )
}