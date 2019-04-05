'use strict'

const d3 = require('d3')
const NetworkRenderer = require('./network-renderer')
const ScrubberRenderer = require('./scrubber-renderer')
const { options } = require('./options')

class RunRenderer {
  constructor () {
    this.running = false
    this.scrubberRenderer = new ScrubberRenderer()
  }

  stop (clearScrubber = false) {
    this.running = false
    this.scrubberRenderer.stop(clearScrubber)
  }

  async render (run, networkRenderer) {
    this.running = true
    this.scrubberRenderer.render(run)

    d3.select('#canvas-nodes').selectAll('.node').remove()
    d3.select('#canvas-edges').selectAll('.arrow').remove()

    const total = run[run.length - 1][2] - run[0][2]
    const progress = this.scrubberRenderer.renderProgress(total)

    let cumulative = 0
    for (let i = 0; i < run.length; i++) {
      if (!this.running) {
        return this.stop()
      }
      const e = run[i]
      const event = { data: JSON.stringify(e[1]) }
      networkRenderer.emit(e[0], event)
      if (i < run.length - 1) {
        const delay = run[i + 1][2] - e[2]
        progress.sync(cumulative)
        cumulative += delay
        await new Promise(r => setTimeout(r, delay * options.speedPercent / 100))
      }
    }

    this.stop()
  }
}

module.exports = RunRenderer
