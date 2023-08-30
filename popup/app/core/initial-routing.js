(() => {
  const onDOMContentLoaded = async () => {
    Store.subscribeToState(async (state) => {
      // Handle on-boarding screen passed
      if (state.config.toLang !== null) {
        Router.makeActiveScreen(Router.SCREEN.main)
      }
    })
  }

  window.addEventListener('DOMContentLoaded', onDOMContentLoaded)
})()