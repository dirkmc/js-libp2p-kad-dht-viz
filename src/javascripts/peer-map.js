'use strict'

class PeerMap {
  constructor() {
    this.peers = new Map()
  }

  get (peer) {
    const id = peer.b58
    return this.peers.get(id)
  }

  has (peer) {
    const id = peer.b58
    return this.peers.has(id)
  }

  set (peer, value) {
    if (!this.has(peer)) {
      const id = peer.b58
      this.peers.set(id, value)
    }
  }

  delete (peer) {
    const id = peer.b58
    this.peers.delete(id)
  }

  clear () {
    this.peers.clear()
  }

  values () {
    return this.peers.values()
  }

  [Symbol.iterator] () {
    return this.values()
  }
}

module.exports = PeerMap
