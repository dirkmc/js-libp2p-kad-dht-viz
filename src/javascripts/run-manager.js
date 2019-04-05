'use strict'

const RunPathRenderer = require('./run-path-renderer')

class RunManager {
  constructor () {
    this.runPathRenderer = new RunPathRenderer(this)

    this.runPaths = new Map()
    this.runs = new Map()
    this.peerQueuedAt = new Map()

    this.start()
  }

  start () {
    this.interval = setInterval(() => {
      for (const runKey of this.runs.keys()) {
        this.runPathRenderer.render(runKey)
      }
    }, 1000)
  }

  stop () {
    clearInterval(this.interval)
    this.runPathRenderer.stop()
    this.runPaths.clear()
    this.runs.clear()
    this.peerQueuedAt.clear()
  }

  update (run) {
    const { name, runKey, pathId, running = [], pending } = run

    if (!this.runs.has(runKey)) {
      this.runs.set(runKey, { runKey, name })
    }

    if (!this.runPaths.has(runKey)) {
      this.runPaths.set(runKey, new Map())
    }

    for (const p of running) {
      if (!this.peerQueuedAt.has(p)) {
        this.peerQueuedAt.set(p, Date.now())
      }
    }

    const paths = this.runPaths.get(runKey)
    paths.set(pathId, { running, pending })
    this.runPathRenderer.render(runKey)
  }

  complete (run) {
    const { runKey, pathId, running, pending } = run
    const paths = this.runPaths.get(runKey)
    if (!paths) {
      return
    }
    paths.set(pathId, { running: [], pending: 0 })
    this.runPathRenderer.render(runKey)
  }
}

module.exports = RunManager
