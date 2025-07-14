import { useState, useRef, useEffect, use } from 'react'
import TQPullDownRefresh from './TQPullDownRefresh.js'
import refreshIcon from './assets/refresh.png'

import './Drag.css'

// 开源，更多的自定义
export default function Drag({ ref, onStartRequest }) {
  const pullDownRefresh = useRef(null)
  const containerRef = useRef(null)
  const refresherRef = useRef(null)

  useEffect(() => {
    pullDownRefresh.current = new TQPullDownRefresh({
      containerRef: containerRef.current,
      refresherRef: refresherRef.current,
    }, () => {
      console.log('Drag started')
    }, () => {
      console.log('Drag ended')
      onStartRequest && onStartRequest({ 
        target: { 
          springBack: () => pullDownRefresh.current.springBack() 
        } 
      })
    }, (y) => {
      console.log(`Dragging at: ${y}`)
    })

    return () => {
      pullDownRefresh.current.deinit()
    }
  }, [])

  // vite press 
  // dumi
  // storybook

  return (
    <div className='container'>
      <div className="area" ref={containerRef}>
        <div 
          className="sample" 
          ref={refresherRef}
        >
          <img src={refreshIcon} width="25px" height="25px" />
        </div>
      </div>
    </div>
  )
}