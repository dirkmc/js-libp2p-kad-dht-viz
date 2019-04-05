'use strict'

class Recorder {
  constructor () {
    this.runsKey = 'dht-viz.recorder.runs'
    this.runsIndexKey = this.runsKey + '.index'
    this.runs = []
    this.running = false

    this._loadAll()
  }

  start (startupEvents) {
    this.running = true
    this.runs.push([])

    for (const e of startupEvents) {
      this.onEvent(...e)
    }
  }

  stop () {
    this.running = false
    this._saveCurrent()
  }

  delete (run) {
    const index = this.runs.indexOf(run)
    this.runs.splice(index, 1)
    const runKey = this.runsKey + '.run.' + run[0][2]
    localStorage.removeItem(runKey)

    const runsIndex = this.runs.map(r => r[0][2])
    localStorage.setItem(this.runsIndexKey, JSON.stringify(runsIndex))
  }

  _loadAll () {
    const runsIndex = JSON.parse(localStorage.getItem(this.runsIndexKey))
    for (let i of runsIndex) {
      const runKey = this.runsKey + '.run.' + i
      const runJson = localStorage.getItem(runKey)
      try {
        const r = JSON.parse(runJson)
        if (r) {
          this.runs.push(JSON.parse(runJson))
        } else {
          localStorage.removeItem(runKey)
        }
      } catch(e) {
        console.error('Couldnt parse run with key %s: %s', runKey, e.message)
        localStorage.removeItem(runKey)
      }
    }
  }

  _saveCurrent () {
    const runIndex = this.runs.length - 1
    const run = this.runs[runIndex]
    if (run && run.length) {
      const runJson = JSON.stringify(run)
      localStorage.setItem(this.runsKey + '.run.' + run[0][2], runJson)
      const runsIndex = this.runs.map(r => r[0][2])
      localStorage.setItem(this.runsIndexKey, JSON.stringify(runsIndex))
    }
  }

  onEvent (name, data) {
    if (!this.running) {
      return
    }
    // console.log(name, data, Date.now())
    const current = this.runs[this.runs.length - 1]
    current.push([name, data, Date.now()])
  }
}

module.exports = new Recorder()
