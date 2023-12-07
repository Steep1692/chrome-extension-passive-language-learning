import { getAttrsNormalized } from './attributes.js'
import { ReactiveState } from './reactivity.js'

const LISTENER_PREFIX = 'data-listen-on-'
const attachListeners = ($el, ctx) => {
  const attrs = getAttrsNormalized($el)

  for (const key in attrs) {
    const value = attrs[key]

    if (key.startsWith(LISTENER_PREFIX)) {
      const eventName = key.slice(LISTENER_PREFIX.length).toLowerCase()

      $el.addEventListener(eventName, async (...args) => {
        ReactiveState.disableReactivity()
        await ctx.methods[value](ctx, ...args)
        ReactiveState.enableReactivity()
      })
    }
  }
}

export const attachListenersToChildren = ($root, ctx) => {
  const $children = [...$root.children]

  for (const $child of $children) {
    attachListeners($child, ctx)
    attachListenersToChildren($child, ctx)
  }
}