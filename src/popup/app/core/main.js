class ScriptManager {
  static injectScriptToPage = (src) => {
    const n = document.createElement('script')
    document.documentElement.append(n)
    n.src = src
    n.defer = true
    return new Promise((resolve) => {
      n.onload = resolve
    })
  }
}

(async () => {
  const isIgnoredOrigin = (state) => state.config.ignoredOrigins.includes(state.clientInfo.origin)
  const isDisabled = (state) => state.config.disabledAtAll || isIgnoredOrigin(state)

  const disabledClassName = 'disabled'
  const $body = document.body;

  const disabledMarkupController = (state) => {
      // Handle disabled UI state
      if (isDisabled(state)) {
        $body.classList.add(disabledClassName)
      } else {
        $body.classList.remove(disabledClassName)
      }
  }

  // FIXME: Heavy operation
  const removeProxies = (obj) => JSON.parse(JSON.stringify(obj))

  const componentInjections = import('/popup/app/components/injections.js')
  const sharedComponentInjectionsData = import('/shared-resources/components/injections.js')
  const pluginInjectionsData = import('/shared-resources/plugins/injections.js')

  const contentAPIData = ScriptManager.injectScriptToPage('/shared-resources/core/content-script-api.js')
  const stateMutatorsData = ScriptManager.injectScriptToPage('/shared-resources/core/state-mutators.js')
  const themeControllerData = ScriptManager.injectScriptToPage('/shared-resources/core/theme-controller.js')

  const abacusLibData = ScriptManager.injectScriptToPage('/shared-resources/core/abacus-lib.js')

  Promise.all([
    componentInjections,
    sharedComponentInjectionsData,
    pluginInjectionsData,

    contentAPIData,

    stateMutatorsData,
    abacusLibData,

    themeControllerData,
  ]).then(async ([res1, res2, res3]) => {

    ContentScriptApi.getData().then(({ state }) => {
      AbacusLib.init({
        state,
        stateMutators: StateMutators,
        componentInjections: {
          ...res1.default,
          ...res2.default,
        },
        pluginInjections: res3.default,

        onStateMutation: (mutatorName, ...args) => {
          // Update theme when {config.theme} is changed
          if (mutatorName === 'updateConfig') {
            const [payload] = args
            if (payload.theme) {
              ThemeController.applyTheme(payload.theme)
            }

            disabledMarkupController(state)
          }

          // Update state in ContentScriptApi
          ContentScriptApi.setData(removeProxies(state))
        },
      })

      ThemeController.applyTheme(state.config.theme)
      disabledMarkupController(state)

      if (!state.config.onboarded) {
        StateMutators.setRoute(state, 'settings')
      }
    })

  })
})()