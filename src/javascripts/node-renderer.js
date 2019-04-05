'use strict'

const d3 = require('d3')
const { options } = require('./options')

class NodeRenderer {
  constructor () {
    this.canvas = d3.select('#canvas-nodes')
  }

  stop () {
    this.canvas.selectAll('.node').remove()
  }

  render (peers) {
    // console.log('render', peers)
    const node = this.canvas.selectAll('.node').data(peers, p => p.b58)
      .attr('transform', p => `translate(${p.pos})`)

    // node enter
    const nodeEnter = node.enter().append('g')
      .classed('node', true)
      .attr('id', p => 'node-' + p.b58)


    nodeEnter.append('circle').classed('main-circle', true)
      .attr('r', options.nodeRadius)
      .style('stroke', p => p.isSelf ? '#f00' : '#999')
      .style('fill', 'transparent')
  }
}

module.exports = NodeRenderer
