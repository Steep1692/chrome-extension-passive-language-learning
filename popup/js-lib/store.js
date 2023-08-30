class Store {
  static state
  static clientInfo = {}
  static dataUpdatedSubscriptions = []
  static initialFetch = null

  static async refreshDataWithContentScript() {
    const promise = new Promise((resolve) => {
      ContentScriptApi.getData().then(({ state, clientInfo }) => {
        Store.clientInfo = clientInfo
        Store.state = state
        resolve();
      });
    })

    Store.initialFetch = promise

    return promise
  }

  static async initStore() {
    return Store.refreshDataWithContentScript()
  }

  static async setState (newState, newClientInfo) {
    const prevState = Store.state ?? newState
    Store.state = newState

    if (newClientInfo) {
      Store.clientInfo = newClientInfo
    }

    for (const cb of Store.dataUpdatedSubscriptions) {
      await cb(Store.state, prevState, { init: false })
    }

    await ContentScriptApi.setData({
      dictionary: newState.dictionary,
      config: newState.config,
    })
  }

  static async subscribeToState(cb, preventCallOnSuccessSubscribe = false) {
    Store.dataUpdatedSubscriptions.push(cb)

    if (preventCallOnSuccessSubscribe === false) {
      await Store.initialFetch
      await cb(Store.state, Store.state, { init: true })
    }
  }

  static addItem(payload) {
    const newDict = [...Store.state.dictionary, payload]
    const newState = {
      ...Store.state,
      dictionary: newDict,
    }

    return Store.setState(newState)
  }

  static editItem(index, payload) {
    const newDict = Store.state.dictionary.map((item, i) => {
      if (i === index) {
        return {
          ...Store.state.dictionary[index],
          ...payload,
        }
      }
      return item
    })
    const newState = {
      ...Store.state,
      dictionary: newDict,
    }

    return Store.setState(newState)
  }

  static deleteItem(index) {
    const newDict = Store.state.dictionary.filter((_, i) => i !== index)
    const newState = {
      ...Store.state,
      dictionary: newDict,
    }

    return Store.setState(newState)
  }

  static updateConfig(payload) {
    const newState = {
      ...Store.state,
      config: {
        ...Store.state.config,
        ...payload,
      }
    }

    return Store.setState(newState)
  }
}

Store.initStore()