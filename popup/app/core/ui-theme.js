(() => {
  const isIgnoredOrigin = (state, clientInfo) => state.config.ignoredOrigins.includes(clientInfo.origin)
  const isDisabled = (state, clientInfo) => state.config.disabledAtAll || isIgnoredOrigin(state, clientInfo)

  const onDOMContentLoaded = async () => {
    const disabledClassName = 'disabled'
    const $body = document.body;

    Store.subscribeToState(async (state) => {
      // Handle disabled UI state
      if (isDisabled(state, Store.clientInfo)) {
        $body.classList.add(disabledClassName)
      } else {
        $body.classList.remove(disabledClassName)
      }
    })
  }

  window.addEventListener('DOMContentLoaded', onDOMContentLoaded)
})()