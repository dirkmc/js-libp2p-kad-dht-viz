'use strict'

const sseManager = require('./sse-manager')

async function init () {
  sseManager.start()
}

document.addEventListener('DOMContentLoaded', init)
