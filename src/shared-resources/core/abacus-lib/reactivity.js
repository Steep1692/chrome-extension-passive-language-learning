export class Reactivity {
  static targetKeys = new Map()

  static reactiveProps = new Map()
  static callbacks = new Map()
  static callbacksSecondary = new Map()

  static makeKey(target, prop) {
    if (!Reactivity.targetKeys.has(target)) {
      Reactivity.targetKeys.set(target, Math.random())
    }
    return Reactivity.targetKeys.get(target) + '-' + prop
  }

  static registerReactiveProp(componentName, target, prop) {
    const key = Reactivity.makeKey(target, prop)

    if (Reactivity.reactiveProps.has(key)) {
      const componentNames = Reactivity.reactiveProps.get(key)
      if (!componentNames.includes(componentName)) {
        componentNames.push(componentName)
      }
    } else {
      Reactivity.reactiveProps.set(key, [componentName])
    }
  }

  static registerCallback(componentName, cb, secondary = false) {
    const callbacks = secondary ? Reactivity.callbacksSecondary : Reactivity.callbacks

    if (callbacks.has(componentName)) {
      callbacks.get(componentName).push(cb)
    } else {
      callbacks.set(componentName, [cb])
    }
  }

  static handleReactivePropChange(target, prop) {
    const key = Reactivity.makeKey(target, prop)
    const componentNames = Reactivity.reactiveProps.get(key)

    if (!componentNames) {
      return;
    }

    const secondaryCallbacks = []
    console.count('handleReactivePropChange')
    for (const componentName of componentNames) {
      const callbacks = Reactivity.callbacks.get(componentName)
      const callbacksSecondary = Reactivity.callbacksSecondary.get(componentName)

      for (const cb of callbacks) {
        cb()
      }

      if (callbacksSecondary) {
        secondaryCallbacks.push(...callbacksSecondary)
      }
    }

    for (const cb of secondaryCallbacks) {
      cb()
    }
  }
}

export class ReactiveState {
  static preventReactivityGetHandler = false
  static REACTIVITY_PROXY_TARGET_KEY = Symbol('link on the original target object')
  static reactionReceiverID = null
  static state

  static needsProxying = (value) => {
    return typeof value === 'object'
      && value !== null
      && !(value instanceof Promise)
  }

  static proxyState = (obj) => {
    let setInProcess = false
    let proxyingChildren

    const handler = {
      get(target, prop, receiver) {
        if (!proxyingChildren && !setInProcess && !ReactiveState.preventReactivityGetHandler) {
          const isMethod = typeof target[prop] === 'function'

          if (!isMethod && ReactiveState.reactionReceiverID !== null) {
            Reactivity.registerReactiveProp(ReactiveState.reactionReceiverID, target, prop)
          }
        }

        return Reflect.get(...arguments)
      },
      set(target, prop, value) {
        setInProcess = true

        const res = Reflect.set(...arguments)

        if (!proxyingChildren) {
          if (ReactiveState.needsProxying(value)) {
            target[prop] = ReactiveState.proxyState(value)
          }

          Reactivity.handleReactivePropChange(target, prop, value)
        }

        setInProcess = false

        return res
      },
    }

    obj[ReactiveState.REACTIVITY_PROXY_TARGET_KEY] = obj
    const objProxy = new Proxy(obj, handler)

    proxyingChildren = true
    for (const objKey in objProxy) {
      const value = objProxy[objKey]
      if (ReactiveState.needsProxying(value)) {
        objProxy[objKey] = ReactiveState.proxyState(value)
      }
    }
    proxyingChildren = false

    return objProxy
  }

  static init = (state) => {
    ReactiveState.state = ReactiveState.proxyState(state)
  }

  static disableReactivity = () => {
    ReactiveState.preventReactivityGetHandler = true
  }

  static enableReactivity = () => {
    ReactiveState.preventReactivityGetHandler = false
  }

  static getWithoutReactivity = (obj, ...props) => {
    ReactiveState.disableReactivity()

    let res = obj
    for (const prop of props) {
      res = res[prop]
    }

    ReactiveState.enableReactivity()
    return res
  }
}
