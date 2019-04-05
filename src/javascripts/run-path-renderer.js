'use strict'

const d3 = require('d3')
const util = require('./util')
const { getColor } = require('./color')

class RunPathRenderer {
  constructor (runManager) {
    this.runManager = runManager
    this.canvas = d3.select('.run-paths')
  }

  stop () {
    this.canvas.selectAll('.run').remove()
  }

  render (runKey) {
    const runInfo = this.runManager.runs.get(runKey)
    const runPaths = this.runManager.runPaths
    const peerQueuedAt = this.runManager.peerQueuedAt

    // run
    const run = this.canvas.selectAll('.run').data([...runPaths])

    const runEnter = run.enter().append('div')
      .classed('run', true)
      .text(() => `${runInfo.name} ${runInfo.runKey.substr(-6)}`)

    // path
    const path = run.selectAll('.path').data((d) => [...d[1]])

    const pathEnter = path.enter().append('div')
      .classed('path', true)

    path.text((d) => {
      const q = d[1]
      return `Path: ${q.running.length} / ${q.running.length + q.pending}`
    }).style('color', (d) => getColor(d[0]))

    // peer
    const peer = path.selectAll('.peer').data((d) => {
      const q = d[1]
      return d[1].running.sort((a, b) => peerQueuedAt.get(a) - peerQueuedAt.get(b))
    })

    const peerEnter = peer.enter().append('div')
      .classed('peer', true)
      .text((d) => {
        const t = Date.now() - peerQueuedAt.get(d)
        return `${util.toMinuteSecond(t) || '00:00'} ${d.substr(-4)}`
      })
  }
}

module.exports = RunPathRenderer
