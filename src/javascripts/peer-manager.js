'use strict'

const BigNumber = require('bignumber.js')
const bs58 = require('bs58')
const PeerSet = require('./peer-set')
const NodeRenderer = require('./node-renderer')

class PeerManager {
  constructor (origin) {
    this.allPeers = new PeerSet()
    this.nodeRenderer = new NodeRenderer()
  }

  start (origin) {
    this.me = this.decoratePeer(origin, true)
  }

  stop () {
    this.allPeers.clear()
    this.nodeRenderer.stop()
  }

  setLayout (layout) {
    this.layout = layout
  }

  bootstrap (peers) {
    for (const p of peers) {
      const peer = this.decoratePeer(p)
      this.addPeer(peer)
    }
  }

  addPeer (peer) {
    peer = this.decoratePeer(peer)

    if (this.allPeers.has(peer)) {
      return this.allPeers.get(peer)
    }

    this.allPeers.add(peer)

    if(!peer.isSelf) {
      this.layout.add(peer)
    }

    this.render()
    return peer
  }

  decoratePeer (peerId, isSelf) {
    // Already decorated
    if (typeof peerId === 'object') {
      return peerId
    }

    const buff = bs58.decode(peerId)
    const num = BigNumber('0x' + buff.slice(2).toString('hex'))

    return {
      isSelf: isSelf || peerId === this.me.b58,
      b58: peerId,
      num
    }
  }

  rerender () {
    for (const p of this.allPeers) {
      this.layout.setPeerPosition(p)
    }
    this.render()
  }

  render () {
    this.nodeRenderer.render([...this.allPeers])
  }
}

module.exports = PeerManager
