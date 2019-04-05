'use strict'

const BigNumber = require('../../node_modules/bignumber.js/bignumber.js')
const max = BigNumber('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')

const DefaultOptions = {
  paddingY: 20,
  nodeRadius: 10
}

class Layout {
  constructor(canvas, me, options = {}) {
    this.canvas = canvas
    this.me = me
    this.options = Object.assign({}, DefaultOptions, options)
    this.me.pos = this.getOrigin()
    this.peers = []
    this.peerIds = new Set()
  }

  add (peer) {
    if (peer.b58 === this.me.b58) {
      return
    }

    if (!this.peerIds.has(peer.b58)) {
      this.peers.push(peer)
    }
  }

  getCenter() {
    return [this.getWidth() / 2, this.options.paddingY + this.getHeight() / 2]
  }

  getHeight() {
    return this.canvas.node().getBoundingClientRect().height - (this.options.paddingY * 2)
  }

  getWidth() {
    return this.canvas.node().getBoundingClientRect().width
  }

  getRadius() {
    return Math.min(this.getHeight(), this.getWidth()) / 2
  }
}

// Layout nodes in two dimensions around a center point, by assigning each node
// an angle such that the node is in the largest gap between two previous nodes
class Radial extends Layout {
  add (peer) {
    super.add(peer)
    if (!peer.pos) {
      this.setPeerPosition(peer)
    }
  }

  setPeerPosition (peer) {
    peer.pos = this.getPos(peer)
  }

  getOrigin () {
    return this.getCenter()
  }

  getPos (peer) {
    if (peer.b58 === this.me.b58) {
      return this.getOrigin()
    }

    const centerPx = this.getCenter()
    const radiusPx = this.getRadius() - this.options.nodeRadius
    const proportion = this.getProportionalDistance(peer)
    const distancePx = Math.max(this.options.nodeRadius * 2, proportion * radiusPx)

    const angle = this.getAngle(peer)
    const x = parseInt(centerPx[0] + Math.cos(angle) * distancePx)
    const y = parseInt(centerPx[1] + Math.sin(angle) * distancePx)
    return [x, y]
  }

  getProportionalDistance (peer) {
    const maxDelta = BigNumber.max(max.minus(this.me.num), this.me.num)
    const delta = peer.num.minus(this.me.num)
    const proportion = delta.div(maxDelta)
    return Math.abs(proportion.toNumber())
  }

  getAngle (peer) {
    const index = this.peers.indexOf(peer)
    if (index === 0) {
      return 0
    }

    const sector = Math.floor(Math.log2(index))
    const rotations = Math.pow(2, sector)
    const offset = Math.PI / rotations
    const slice = offset * 2
    const sectorIndex = index - rotations
    return offset + sectorIndex * slice
  }
}

// Same as the Radial layout but the distances are stretched, such that peers
// close to the center are spaced further apart than nodes at the edges
class RadialStretch extends Radial {
  getProportionalDistance (peer) {
    const maxDelta = BigNumber.max(max.minus(this.me.num), this.me.num)
    const delta = peer.num.minus(this.me.num)

    // < 0.5 : (2 - 2 * x) * x
    let proportion = Math.abs(delta.div(maxDelta).toNumber())
    if (proportion < 0.5) {
      proportion = (2 - 2 * proportion) * proportion
    }
    return proportion
  }
}

module.exports = {
  Radial,
  RadialStretch
}
