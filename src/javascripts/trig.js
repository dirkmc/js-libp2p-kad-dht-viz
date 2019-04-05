'use strict'

const Trig = {
  angle(from, to) {
    if (!from.pos) console.log('angle missing from.pos', from)
    if (!to.pos) console.log('angle missing to.pos', to)

    const dx = to.pos[0] - from.pos[0]
    const dy = to.pos[1] - from.pos[1]
    const signx = dx < 0 ? -1 : 1
    const signy = dy < 0 ? -1 : 1
    let angle = Math.atan(Math.abs(dy / dx))
    if (dx < 0) {
      if (dy < 0) {
        angle = Math.PI + angle
      } else {
        angle = Math.PI - angle
      }
    } else if (dy < 0) {
      angle = 2 * Math.PI - angle
    }
    return angle
  },

  onLine(from, to, howFarPx, fromStart = true) {
    if (!from.pos) console.log('onLine missing from.pos', from)
    if (!to.pos) console.log('onLine missing to.pos', to)

    const dx = to.pos[0] - from.pos[0]
    const dy = to.pos[1] - from.pos[1]
    const total = Math.sqrt(dx * dx + dy * dy)
    const proportion = howFarPx / total
    return Trig.onLineProportional(from, to, proportion, fromStart)
  },

  onLineProportional(from, to, proportion, fromStart = true) {
    if (!from.pos) console.log('onLineProportional missing from.pos', from)
    if (!to.pos) console.log('onLineProportional missing to.pos', to)

    proportion = fromStart ? proportion : 1 - proportion
    const dx = to.pos[0] - from.pos[0]
    const dy = to.pos[1] - from.pos[1]
    const relx = proportion * dx
    const rely = proportion * dy
    return [from.pos[0] + relx, from.pos[1] + rely]
  }
}
module.exports = Trig
