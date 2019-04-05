'use strict'

const d3 = require('d3')
const util = require('./util')
const NetworkRenderer = require('./network-renderer')

class ScrubberRenderer {
  constructor () {
    this.running = false
    this.canvas = d3.select('#canvas-scrubber')
  }

  stop (clear) {
    this.running = false
    if (clear) {
      this.canvas.select('.time-bar').attr('transform', `translate(0, 0)`)
      this.canvas.selectAll('.bar').remove()
    }
  }

  render (events) {
    this.canvas.selectAll('.bar').remove()
    const rect = this.canvas.node().getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const start = events[0][2]
    const total = events[events.length - 1][2] - start
    const pxPerMilli = width / total

    const bars = []
    for (const e of events) {
      const at = e[2]
      const x = Math.round(width * (at - start) / total)
      const lastBar = bars[bars.length - 1]
      if (lastBar && lastBar.x === x) {
        lastBar.y++
      } else {
        bars.push({
          x,
          y: 1
        })
      }
    }

    const bar = this.canvas.selectAll('.bar').data(bars)

    // node enter
    const nodeEnter = bar.enter().append('g')
      .classed('bar', true)
    nodeEnter.append('rect')
      .attr('x', d => d.x)
      .attr('y', d => height - Math.max(d.y, 2))
      .attr('width', '2')
      .attr('height', d => Math.max(d.y, 2))
  }

  renderProgress (total) {
    this.running = true

    let cumulative = 0
    let currentStart

    const width = this.canvas.node().getBoundingClientRect().width
    const timeBarWidth = this.canvas.select('.time-bar').node().getBoundingClientRect().width

    const timeBar = this.canvas.select('.time-bar')
      .attr('transform', `translate(0, 0)`)

    const clock = d3.select('#progress-clock')
      .text('00:00')

    const onAnimationFrame = () => {
      const t = cumulative + Date.now() - currentStart
      if (t > total) {
        clock.text('')
        return
      }
      const px = width * t / total
      const x = px - timeBarWidth / 2
      timeBar.attr('transform', `translate(${x}, 0)`)
      clock.text(util.toMinuteSecond(t))

      if (this.running) {
        requestAnimationFrame(onAnimationFrame)
      }
    }

    return {
      sync (c) {
        const started = Boolean(currentStart)
        cumulative = c
        currentStart = Date.now()
        if (!started) {
          requestAnimationFrame(onAnimationFrame)
        }
      }
    }
  }
}

module.exports = ScrubberRenderer
