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

    setTimeout(() => {
      this.drayMove(0)
    }, 1500);
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
    this.deinit()
  }

  touchMove(e) {
    const touch = e.touches[0]
    this.move(touch)
  }
}
