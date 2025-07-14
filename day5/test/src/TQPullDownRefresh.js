let lasttime = 0
const nextFrame = window.requestAnimationFrame || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame || 
                  window.msRequestAnimationFrame ||
                  function(callback) {
                    let curtime = +new Date, delay = Math.max(1000 / 60, 1000 / 60 - (curtime - lasttime));
                    lasttime = curtime + delay
                    return setTimeout(callback, delay)
                  }

const cancelFrame = window.cancelAnimationFrame ||
                    window.webkitCancelAnimationFrame ||
                    clearTimeout;

// 动画函数
const tween = {
  linear: function (t, b, c, d) { return c * t / d + b; },
  ease: function (t, b, c, d) { return -c * ((t = t / d - 1) * t * t * t - 1) + b; },
  'ease-in': function (t, b, c, d) { return c * (t /= d) * t * t + b; },
  'ease-out': function (t, b, c, d) { return c * ((t = t / d - 1) * t * t + 1) + b; },
  'ease-in-out': function (t, b, c, d) { if ((t /= d / 2) < 1) return c / 2 * t * t * t + b; return c / 2 * ((t -= 2) * t * t + 2) + b; },
  bounce: function (t, b, c, d) { if ((t /= d) < (1 / 2.75)) { return c * (7.5625 * t * t) + b; } else if (t < (2 / 2.75)) { return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b; } else if (t < (2.5 / 2.75)) { return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b; } else { return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b; } }
}

// target 为目标距离
function slideTo(el, target) {
  // 动画持续时间                    
  const duration = 1000
  let timer = null

  const stime = Date.now()
  cancelFrame(timer)
  ani()
  function ani() {
    const offset = Math.min(duration, Date.now() - stime)
    const s = tween.ease(offset, 0, 1, duration)
    if (offset < duration) {
      el.style.transform = `translate(0px, ${(1 - s) * target}px)`
      timer = nextFrame(ani)
    }
  }
}

const masDragDistance = 300 // 最大拖动距离

export default class TQPullDownRefresh {

  state = {
    x: 0,
    y: 0,
    endX: 0,  
    endY: 0,
    ladderDistance: 0, // 阶梯下降时阶梯的数值
    lastX: 0,
    lastY: 0,
    rate: 1,
    isRunning: false
  }
  containerRef = null
  areaRect = null
  draggerEle = null
  draggerRect = null

  onDragStart = null
  onDragEnd = null
  onDragMove = null

  constructor(options = {}, onDragStart, onDragEnd, onDragMove) {
    this.options = options
    this.onDragStart = onDragStart
    this.onDragEnd = onDragEnd
    this.onDragMove = onDragMove

    // 拖拽区域
    this.containerRef = options.containerRef || document.getElementById(options.containerId)
    this.areaRect = this.containerRef.getBoundingClientRect()

    // 拖拽小球
    this.draggerEle = options.refresherRef || document.getElementById(this.options.refresherId)
    this.draggerRect = this.draggerEle.getBoundingClientRect()

    this.draggerEle.addEventListener('touchstart', this.touchStart.bind(this))
    this.draggerEle.addEventListener('touchmove', this.touchMove.bind(this))
    this.draggerEle.addEventListener('touchend', this.touchEnd.bind(this))

    this.options = options
  }

  prepare(touch) {
    this.draggerRect = this.draggerEle.getBoundingClientRect()

    this.state.x = this.draggerRect.left
    this.state.y = this.draggerRect.top
  }

  deinit() {
    if (this.state.y >= masDragDistance) {
      this.rotate(0)
    } else {
      this.springBack()
    }

    this.draggerEle.removeEventListener('touchstart', this.touchStart)
    this.draggerEle.removeEventListener('touchmove', this.touchMove)
    this.draggerEle.removeEventListener('touchend', this.touchEnd)
  }

  rotate(angle) {
    this.draggerEle.style.transform = `translate(0px, ${this.state.y}px)  rotate(${angle}deg)`

    if (angle === -360) {
      angle = 0
    }

    let timer = null
    cancelFrame(timer)

    if (this.state.isRunning) {
      timer = nextFrame(() => {
        this.rotate(angle - 5)
      })
    }
  }

  move(touch) {
    const dy = touch.clientY - this.state.lastY

    this.state.lastY = touch.clientY
    this.state.rate = this.getRate(dy, this.state.rate)
    this.state.y += dy * this.state.rate

    if (this.state.y >= masDragDistance) {
      this.state.y = masDragDistance
    }

    if (this.state.y < 0) {
      this.state.y = 0
    }

    this.drayMove(this.state.y)

    return this.state.y
  }

  // 手势
  getRate(distance, rate) {
    this.state.ladderDistance += distance

    if (distance > 0) {
      if (this.state.ladderDistance >= 100) {
        rate = Math.max(0, rate - 0.1)

        this.state.ladderDistance = 0
      }

    } else {
      if (this.state.ladderDistance < -100) {
        rate = Math.min(1, rate + 0.1)
        this.state.ladderDistance = 0
      }
    }

    return rate
  }

  drayMove(translateY) {
    if (!this.draggerEle) 
      return

    const angle = ~~(translateY / masDragDistance * 360) * -1
    console.log(`translateY: ${translateY}, angle: ${angle}`)
    this.draggerEle.style.transform = `translate(0px, ${translateY}px) rotate(${angle}deg)`
  }

  touchStart(e) {
    this.state.isRunning = true
    const touch = e.touches[0]
    this.prepare(touch)
    this.onDragStart && this.onDragStart()
  }

  touchEnd(e) {
    this.deinit()
    this.onDragEnd && this.onDragEnd()
  }

  // 回弹
  springBack() {
    this.state.isRunning = false
    const rect = this.draggerEle.getBoundingClientRect()
    slideTo(this.draggerEle, rect.top)

    this.state.rate = 1
    this.state.lastY = 0
  }

  touchMove(e) {
    const touch = e.touches[0]
    const y = this.move(touch)
    this.onDragMove && this.onDragMove(y)
  }
}
