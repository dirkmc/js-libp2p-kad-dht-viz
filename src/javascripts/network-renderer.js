'use strict'

const d3 = require('d3')
const EventEmitter = require('events')
const DialRenderer = require('./dial-renderer')
const RunManager = require('./run-manager')
const PeerMap = require('./peer-map')
const PeerManager = require('./peer-manager')
const Layout = require('./layout')
const { options } = require('./options')
const debounce = require('lodash/debounce')

class NetworkRenderer extends EventEmitter {
  constructor () {
    super()

    this.peerManager = new PeerManager()
    this.dialMap = new PeerMap()
    this.runManager = new RunManager()
    this.dialRenderer = new DialRenderer(this.peerManager)

    this.start()
  }

  stop () {
    this.removeAllListeners()
    this.peerManager.stop()
    this.dialMap.clear()
    this.runManager.stop()
    this.dialRenderer.stop()
  }

  start () {
    this.on('init', (event) => {
      const p = JSON.parse(event.data)
      this.onInit(p)
    })

    this.on('connect', (event) => {
      const p = JSON.parse(event.data)
      this.peerManager.bootstrap(p.known)
    })

    this.on('peer', (event) => {
      const p = JSON.parse(event.data)
      this.peerManager.addPeer(p)
    })

    // this.on('dial', (event) => {
    //   const p = JSON.parse(event.data)
    //   const peer = addPeer(p)
    //   this.dialMap.add(peer)
    //   this.dialRenderer.render([...this.dialMap])
    // })

    // this.on('dial complete', (event) => {
    //   const p = JSON.parse(event.data)
    //   const peer = decoratePeer(p)
    //   this.dialMap.delete(peer)
    //   this.dialRenderer.render([...this.dialMap])
    // })

    this.on('query', (event) => {
      const data = JSON.parse(event.data)
      const { peerId, pathId } = data
      const peer = this.peerManager.addPeer(peerId)
      this.dialMap.set(peer, { peer, pathId })
      this.dialRenderer.render([...this.dialMap.values()])
    })

    this.on('query complete', (event) => {
      const data = JSON.parse(event.data)
      const { peerId } = data
      const peer = this.peerManager.addPeer(peerId)
      this.dialMap.delete(peer)
      this.dialRenderer.render([...this.dialMap.values()])
    })

    this.on('run', (event) => {
      const data = JSON.parse(event.data)
      // console.log('run', data)

      // const { runKey } = data
      // if (!runPaths.has(runKey)) {
      //   runPaths.set(runKey, new Map())
      // }
    })

    this.on('queue', (event) => {
      const data = JSON.parse(event.data)
      // console.log('queue', data)
      this.runManager.update(data)
    })

    this.on('queue update', (event) => {
      const data = JSON.parse(event.data)
      // console.log('queue update', data)
      this.runManager.update(data)
    })

    this.on('queue complete', (event) => {
      const data = JSON.parse(event.data)
      // console.log('queue complete', data)
      this.runManager.complete(data)
    })

    window.addEventListener('resize', debounce(() => {
      console.log('resize')

      this.peerManager.rerender()
      this.dialRenderer.render([...this.dialMap.values()])
      // renderer.setLayoutMode(renderer.layoutMode)
    }, 1000))
  }

  onInit (origin) {
    this.peerManager.start(origin)

    const canvas = d3.select('#canvas')
    this.layout = new Layout.RadialStretch(canvas, this.peerManager.me, options)
    this.peerManager.setLayout(this.layout)

    this.peerManager.addPeer(this.peerManager.me)
  }

  simulatedStartupEvents () {
    const knownPeerIds = [...this.peerManager.allPeers.keys()]
    return [
      ['init', this.peerManager.me.b58],
      ['connect', { known: knownPeerIds }]
    ]
  }
}

module.exports = NetworkRenderer
