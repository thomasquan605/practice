lasttime = 0
const nextFrame = window.requestAnimationFrame || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame || 
                  window.msRequestAnimationFrame ||
                  function(callback) {
                    let curtime = +new Date, delay = Math.max(1000 / 60, 1000 / 60 - (curtime - lasttime));
                    lasttime = curtime + delay
                    return setTimeout(callback, delay)
                  }

// 偷个懒                  
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

class DragBall {

  state = {
    x: 0,
    y: 0,
    endX: 0,  
    endY: 0,
    ladderDistance: 0, // 阶梯下降时阶梯的数值
    lastX: 0,
    lastY: 0,
    rate: 1
  }
  areaRect = null
  draggerEle = null
  draggerRect = null

  constructor(containerId, draggerId, options = {}) {
    // 拖拽区域
    const containerEle = document.getElementById(containerId)
    this.areaRect = containerEle.getBoundingClientRect()

    // 拖拽小球
    this.draggerEle = document.getElementById(draggerId)
    this.draggerRect = this.draggerEle.getBoundingClientRect()

    this.draggerEle.addEventListener('touchstart', (e) => {
      this.touchStart(e)
    })
    this.draggerEle.addEventListener('touchmove', (e) => {
      this.touchMove(e)
    }, { passive: true })
    this.draggerEle.addEventListener('touchend', (e) => {
      this.touchEnd(e)
    }, this.touchEnd)

    this.options = options
  }

  prepare(touch) {
    this.draggerRect = this.draggerEle.getBoundingClientRect()

    this.state.x = this.draggerRect.left
    this.state.y = this.draggerRect.top
  }

  deinit() {
    this.state.rate = 1
    this.state.lastY = 0
  }

  move(touch) {
    const dy = touch.clientY - this.state.lastY
    this.state.lastY = touch.clientY
    this.state.rate = this.getRate(dy, this.state.rate)
    this.state.y += dy * this.state.rate
    this.drayMove(this.state.y)

    this.changeColor(this.state.y, this.draggerEle)

    return this.state.y
  }

  changeColor(y, el) {
    if (y > 400) {
      el.style.backgroundColor = 'red'
    } else {
      el.style.backgroundColor = 'white'
    }

    console.log('y', y)
  }

  getRate(distance, rate) {
    this.state.ladderDistance += distance

    if (this.state.ladderDistance >= 100) {
      rate = Math.max(0, rate - 0.1)

      if (rate <= 0.1 && rate > 0) {
        rate = 0
      }

      this.state.ladderDistance = 0
    }

    return rate
  }

  drayMove(translateY) {
    if (!this.draggerEle) 
      return
    this.draggerEle.style.transform = `translate(0px, ${translateY}px)`
  }

  touchStart(e) {
    const touch = e.touches[0]
    this.prepare(touch)
    this.options.onDragStart && this.options.onDragStart()
  }

  touchEnd(e) {
    this.deinit()
    this.options.onDragEnd && this.options.onDragEnd()
  }

  // 回弹
  springBack() {
    const rect = this.draggerEle.getBoundingClientRect()
    slideTo(this.draggerEle, rect.top)
  }

  touchMove(e) {
    const touch = e.touches[0]
    const y = this.move(touch)
    this.options.onDragMove && this.options.onDragMove(y)
  }
}
