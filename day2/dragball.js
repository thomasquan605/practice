let lasttime = 0
const nextFrame = window.requestAnimationFrame || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame || 
                  window.msRequestAnimationFrame ||
                  function(callback) {
                    let curtime = +new Date, delay = Math.max(1000 / 60, 1000 / 60 - (curtime - lasttime));
                    lasttime = curtime + delay
                    return setTimeout(callback, delay)
                  };

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
  const duration = 1000;
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

// 对象，属性，行为
// 行为应该在外部调用
// 封装，思考属性，行为？

// 思考下拉刷新的过程中

class DragBall {
  state = {
    x: 0,
    y: 0,
    endX: 0,  
    endY: 0,
    distance: 0,
    lastX: 0,
    lastY: 0,
    rate: 1
  }
  areaRect = null
  draggerEle = null
  draggerRect = null

  init(containerId, draggerId) {
    // 拖拽区域
    const containerEle = document.getElementById(containerId)
    this.areaRect = containerEle.getBoundingClientRect()

    // 拖拽小球
    this.draggerEle = document.getElementById(draggerId)
    this.draggerRect = this.draggerEle.getBoundingClientRect()

    document.addEventListener('touchstart', (e) => {
      this.touchStart(e)
    } , { passive: true })
    document.addEventListener('touchmove', (e) => {
      this.touchMove(e)
    }, { passive: true })
    document.addEventListener('touchend', (e) => {
      this.touchEnd(e)
    }, this.touchEnd)
  }

  prepare(touch) {
    this.draggerRect = this.draggerEle.getBoundingClientRect()

    this.state.x = this.draggerRect.left
    this.state.y = this.draggerRect.top
  }

  deinit() {
    this.state.rate = 1
    this.state.lastY = 0

      // this.drayMove(0)
      const rect = this.draggerEle.getBoundingClientRect()
      slideTo(this.draggerEle, rect.top)
  }

  move(touch) {
    const dy = touch.clientY - this.state.lastY
    this.state.lastY = touch.clientY

    this.state.rate = this.getRate(dy, this.state.rate)

    this.state.y += dy * this.state.rate

    this.drayMove(this.state.y)
  }

  getRate(distance, rate) {
    this.state.distance += distance

    if (this.state.distance >= 200) {
      rate = Math.max(0, rate - 0.1)

      if (rate <= 0.1 && rate > 0) {
        rate = 0
      }

      this.state.distance = 0
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
  }

  touchEnd(e) {
    console.log('touchEnd')
    this.deinit()
  }

  touchMove(e) {
    const touch = e.touches[0]
    this.move(touch)
  }
}
