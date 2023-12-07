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
      return
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
  static SYMBOL_PROXY_TARGET = Symbol('proxy target')
  static SYMBOL_OBJ_PARENT = Symbol('object parent in state')
  static reactionReceiverID = null
  static onStateMutation = null

  static init = (state) => {
    ReactiveState.state = ReactiveState.proxyState(state)
  }

  static needsProxying = (value) => {
    return typeof value === 'object'
      && value !== null
      && !(value instanceof Promise)
      && !(ReactiveState.SYMBOL_PROXY_TARGET in value)
  }

  static getMutationRecordPath = (target) => {
    ReactiveState.disableReactivity()
    const mutationRecordPath = []

    let parent = target[ReactiveState.SYMBOL_OBJ_PARENT]
    let child = target[ReactiveState.SYMBOL_PROXY_TARGET]

    while (parent) {
      const parentProp = Reflect.ownKeys(parent).find((key, _, arr) => {
        return parent[key]?.[ReactiveState.SYMBOL_PROXY_TARGET] === child
      })

      mutationRecordPath.unshift(parentProp)
      child = parent[ReactiveState.SYMBOL_PROXY_TARGET]
      parent = parent[ReactiveState.SYMBOL_OBJ_PARENT]
    }

    ReactiveState.enableReactivity()
    return mutationRecordPath
  }

  static proxyState = (obj, parentObj) => {
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
            target[prop] = ReactiveState.proxyState(value, target)
          }

          Reactivity.handleReactivePropChange(target, prop)
          const mutationRecord = {
            path: ReactiveState.getMutationRecordPath(target),
            prop,
            value,
          }

          ReactiveState.onStateMutation?.(mutationRecord)
        }

        setInProcess = false

        return res
      },
      deleteProperty(target, prop) {
        const res = Reflect.deleteProperty(...arguments)

        if (Array.isArray(target)) {
          // when removing an item from array there will be 2 operations:
          // 1. delete item
          // 2. change array length
          // we need to ignore the "1. delete item", so we return here
          return res
        }

        Reactivity.handleReactivePropChange(target, prop)
        const mutationRecord = {
          path: ReactiveState.getMutationRecordPath(target),
          prop,
          value: undefined,
          deleteProperty: true,
        }

        ReactiveState.onStateMutation?.(mutationRecord)

        return res
      },
    }

    obj[ReactiveState.SYMBOL_PROXY_TARGET] = obj

    if (parentObj) {
      obj[ReactiveState.SYMBOL_OBJ_PARENT] = parentObj
    }

    const objProxy = new Proxy(obj, handler)

    proxyingChildren = true
    for (const objKey in objProxy) {
      const value = objProxy[objKey]
      if (ReactiveState.needsProxying(value)) {
        objProxy[objKey] = ReactiveState.proxyState(value, objProxy)
      }
    }
    proxyingChildren = false

    return objProxy
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
