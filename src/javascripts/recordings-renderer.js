'use strict'

const moment = require('moment')
const d3 = require('d3')
const EventEmitter = require('events')
const RunRenderer = require('./run-renderer')
const recorder = require('./recorder')

class RecordingsRenderer extends EventEmitter {
  constructor () {
    super()

    this.canvas = d3.select('.recorder')

    this.render()
  }

  render (playing) {
    const run = this.canvas.selectAll('.run')
      .data(recorder.runs.slice().reverse(), r => r[0][2])

    // run update
    run.classed('playing', (d) => d === playing)

    // run enter
    const runEnter = run.enter().append('a')
      .classed('run', true)
      .on('click', (d) => this.emit('click', d))
    runEnter.append('div')
      .classed('at', true)
      .text(d => moment(d[0][2]).format('MM/DD HH:mm:ss'))
    runEnter.append('div')
      .classed('count', true)
      .text(d => d.length + ' events')
    runEnter.append('div')
      .classed('duration', true)
      .text(d => {
        const start = d[0][2]
        const duration = d[d.length - 1][2] - start
        if (duration < 1000) return duration + 'ms'
        const seconds = Math.round(duration / 1000)
        if (seconds < 60) return seconds + 's'
        if (seconds < 60 * 60) return Math.round(seconds / 60) + 'm'
        return Math.floor(seconds / 60 * 60) + 'h'
      })
    runEnter.append('div')
      .classed('close', true)
      .on('click', (d) => {
        d3.event.stopPropagation()
        recorder.delete(d)
        this.render()
      })
      .text('x')

    // run exit
    run.exit().remove()
  }
}

module.exports = RecordingsRenderer
