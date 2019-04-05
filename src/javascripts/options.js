'use strict'

const d3 = require('d3')

// User configurable
const OptionDefaults = {
  // These are specific to the simulator
  // speedPercent: 100
}
// Not configurable
const options = {
  speedPercent: 100,
  nodeRadius: 3
  // preambleByteCount: 2,
  // peerIdByteCount: 32,
  // nodeRadius: 10,
  // paddingY: 20
}

function localStorageKey(name) {
  return 'sim.options.' + name
}

function init() {
  Object.keys(OptionDefaults).forEach(name => {
    // Use local storage to save options values between refreshes
    const localStorageVal = localStorage.getItem(localStorageKey(name))
    localStorage.setItem(localStorageKey(name), localStorageVal === null ? OptionDefaults[name] : localStorageVal)
    Object.defineProperty(options, name, {
      get: () => localStorage.getItem(localStorageKey(name))
    })

    // Set up options inputs
    const div = d3.select('.controls .options').append('div')
    div.attr('class', 'option')
    div.append('label').attr('class', 'row').text(name)
    const input = div.append('input')
      .attr('type', 'text')
      .attr('name', name)
      .attr('value', localStorage.getItem(localStorageKey(name)))
    input.node().addEventListener('keyup', () => localStorage.setItem(localStorageKey(name), input.node().value))
    input.node().addEventListener('change', () => localStorage.setItem(localStorageKey(name), input.node().value))
  })

  // Set up reset button
  // const div = d3.select('.controls .options').append('div')
  // const resetButton = div.attr('class', 'option').append('button')
  // resetButton.text('Reset to Defaults')
  // resetButton.node().addEventListener('click', () => {
  //   Object.keys(OptionDefaults).forEach(name => {
  //     localStorage.setItem(localStorageKey(name), OptionDefaults[name])
  //     d3.select(`.controls .options input[name=${name}]`).node().value = OptionDefaults[name]
  //   })
  //   localStorage.setItem(localStorageKey('showDiasConnections'), true)
  // })
}

document.addEventListener('DOMContentLoaded', init)

module.exports = {
  options,
  localStorageKey
}
