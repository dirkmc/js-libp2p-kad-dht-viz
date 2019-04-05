'use strict'

const d3 = require('d3')
const util = require('./util')

class RecordOptionsRenderer {
  constructor () {
    this.timerInterval = null
    this.start()
  }

  stop () {
    this.clearInterval(this.timerInterval)
  }

  start () {
    d3.select('#record-start').on('click', () => {
      d3.select('#record-controls').classed('recording', true)

      const clockEl = d3.select('#record-timer')
      const start = Date.now()
      const updateTime = () => {
        clockEl.text(util.toMinuteSecond(Date.now() - start))
      }
      updateTime()
      this.timerInterval = setInterval(updateTime, 100)

      require('./sse-manager').startRecording()
    })

    d3.select('#record-stop').on('click', () => {
      d3.select('#record-controls').classed('recording', false)
      require('./sse-manager').stopRecording()
      clearInterval(this.timerInterval)
    })
  }
}

module.exports = RecordOptionsRenderer
