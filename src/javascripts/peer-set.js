'use strict'

class PeerSet {
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

  add (peer) {
    if (!this.has(peer)) {
      const id = peer.b58
      this.peers.set(id, peer)
    }
  }

  delete (peer) {
    const id = peer.b58
    this.peers.delete(id)
  }

  clear () {
    this.peers.clear()
  }

  keys () {
    return this.peers.keys()
  }

  values () {
    return this.peers.values()
  }

  [Symbol.iterator] () {
    return this.values()
  }
}

module.exports = PeerSet
