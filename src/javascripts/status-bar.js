'use strict'

const d3 = require('d3')

class StatusBar {
  constructor () {
    this.el = d3.select('#status')
    this.timeout = null
  }

  show (msg) {
    clearTimeout(this.timeout)
    this.el.text(msg)
  }

  flash (msg) {
    this.el.text(msg)
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.el.text('')
    }, 3000)
  }
}

module.exports = StatusBar
