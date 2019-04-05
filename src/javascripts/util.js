'use strict'

function toMinuteSecond(ms) {
  const s = Math.floor(ms / 1000)
  const secPart = s % 60
  const minPart = Math.floor(s / 60)
  const secStr = secPart < 10 ? '0' + secPart : secPart
  const minStr = minPart < 10 ? '0' + minPart : minPart
  return minStr + ':' + secStr
}

module.exports = {
  toMinuteSecond
}
