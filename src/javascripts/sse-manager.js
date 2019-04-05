'use strict'

const d3 = require('d3')
const NetworkRenderer = require('./network-renderer')
const RunRenderer = require('./run-renderer')
const RecordingsRenderer = require('./recordings-renderer')
const RecordOptionsRenderer = require('./record-options-renderer')
const StatusBar = require('./status-bar')
const recorder = require('./recorder')

class SSEManager {
  constructor () {
    this.statusBar = new StatusBar()
    this.networkRenderer = new NetworkRenderer()

    this.recordOptionsRenderer = new RecordOptionsRenderer()

    this.recordingsRenderer = new RecordingsRenderer()
    this.onRecordingsRendererClick = this.onRecordingsRendererClick.bind(this)
    this.recordingsRenderer.on('click', this.onRecordingsRendererClick)

    this.live = true
    this.activeRun = null
  }

  onRecordingsRendererClick (run) {
    let previousActiveRun = this.activeRun
    this.stopRun()
    if (previousActiveRun === run) {
      this.renderLive()
    } else {
      this.renderRun(run)
    }
  }

  renderLive () {
    this.live = true
    this.networkRenderer = new NetworkRenderer()
    this.recordingsRenderer.render(this.activeRun)
  }

  startRecording () {
    if (this.live) {
      recorder.start(this.networkRenderer.simulatedStartupEvents())
    } else {
      this.networkRenderer.stop()
      this.networkRenderer = new NetworkRenderer()
      recorder.start()
    }
  }

  stopRecording () {
    if (!this.live) {
      this.networkRenderer.stop()
    }
    recorder.stop()
    this.recordingsRenderer.render()
  }

  renderRun (run) {
    this.networkRenderer.stop()
    this.runRenderer && this.runRenderer.stop()
    this.live = false

    this.activeRun = run
    this.recordingsRenderer.render(this.activeRun)
    this.setPlaying(true)
    this.networkRenderer = new NetworkRenderer()
    this.runRenderer = new RunRenderer()
    this.runRenderer.render(run, this.networkRenderer).then(() => {
      if (this.activeRun === run) {
        this.activeRun = null
        this.recordingsRenderer.render()
      }
    })
  }

  stopRun () {
    this.networkRenderer.stop()
    this.runRenderer && this.runRenderer.stop(true)
    this.activeRun = null
  }

  setPlaying (isPlaying) {
    d3.select('.content').classed('playing', isPlaying)
  }

  initLiveButton () {
    d3.select('#show-live-button').on('click', () => {
      this.setPlaying(false)
      this.stopRun()
      this.renderLive()
    })
  }

  start () {
    this.initLiveButton()

    const url = 'http://localhost:8080/sse'
    this.es = new EventSource(url)

    this.listeners = new Map()
    this.eventNames = [
      'connect',
      'peer',
      'query',
      'query complete',
      'dial',
      'dial complete',
      'run',
      'run complete',
      'queue',
      'queue update',
      'queue complete'
    ]
    this.subscribe()
  }

  subscribe () {
    this.addEventListener('message', (event) => {
      const p = JSON.parse(event.data)
      recorder.onEvent('init', p)
      this.networkRenderer.emit('init', event)
    })

    for (const eventName of this.eventNames) {
      this.addEventListener(eventName, (event) => {
        const p = JSON.parse(event.data)
        recorder.onEvent(eventName, p)
        this.networkRenderer.emit(eventName, event)
      })
    }

    this.statusBar.show('Connecting to server...')
    this.addEventListener('open', () => {
      this.statusBar.flash('Connected to server')
    })
    this.addEventListener('error', () => {
      this.statusBar.show('Not connected')
    })
  }

  addEventListener(eventName, listener) {
    this.listeners.set(eventName, listener)
    this.es.addEventListener(eventName, listener)
  }

  unsubscribe () {
    this.recordingsRenderer.removeListener('click', this.onRecordingsRendererClick)
    for (const [name, listener] of this.listeners.entries()) {
      this.es.removeEventListener(name, listener)
    }
    this.listeners.clear()
  }

  stop() {
    this.unsubscribe()
    this.es.close()
  }
}

module.exports = new SSEManager()
