'use strict'

const d3 = require('d3')
const { getColor } = require('./color')
const { options } = require('./options')
const Trig = require('./trig')

class DialRenderer {
  constructor (peerManager) {
    this.peerManager = peerManager
    this.canvas = d3.select('#canvas-edges')
  }

  stop () {
    this.canvas.selectAll('.arrow').remove()
  }

  render (peerData) {
    const me = this.peerManager.me
    // console.log('renderDials', peers)

    const nodeRadius = options.nodeRadius
    const lineColor = '#ccc'
    // const highlightColor = (e) => !this.highlightedPeer || e.from === this.highlightedPeer ? lineColor : 'transparent'
    // const highlightColor = lineColor
    const arrowHeadSymbol = d3.symbol()
      .type(d3.symbolTriangle)
      .size(30)

    const arrow = this.canvas.selectAll('.arrow').data(peerData, p => p.peer.b58)
    applyLineUpdates(arrow.selectAll('line'))
    applyHeadUpdates(arrow.selectAll('path'))

    const arrowEnter = arrow.enter().append('g').classed('arrow', true)
    applyLineUpdates(arrowEnter.append('line'))
    applyHeadUpdates(arrowEnter.append('path').attr('d', arrowHeadSymbol))

    arrow.exit().remove()

    function applyLineUpdates(line) {
      line.style('stroke', d => getColor(d.pathId))
      .attr('x1', d => Trig.onLine(me, d.peer, nodeRadius)[0])
      .attr('y1', d => Trig.onLine(me, d.peer, nodeRadius)[1])
      .attr('x2', d => Trig.onLine(me, d.peer, nodeRadius, false)[0])
      .attr('y2', d => Trig.onLine(me, d.peer, nodeRadius, false)[1])
    }
    function applyHeadUpdates(head) {
      head.attr('fill', d => getColor(d.pathId))
      .attr('transform', d => {
        const pos = Trig.onLine(me, d.peer, nodeRadius + 5, false)
        const a = (Trig.angle(me, d.peer) - Math.PI / 6) * 180 / Math.PI
        return `translate(${pos}) rotate(${a})`
      })
    }
  }

}

module.exports = DialRenderer
