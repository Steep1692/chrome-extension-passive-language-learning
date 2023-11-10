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
  const isIgnoredOrigin = (ignoredOrigins, constants) => ignoredOrigins.includes(constants.clientInfo.origin)
  const isDisabled = (disabledAtAll, ignoredOrigins, constants) => disabledAtAll || isIgnoredOrigin(ignoredOrigins, constants)

  const disabledClassName = 'disabled'
  const $body = document.body

  const disabledMarkupController = (disabledAtAll, ignoredOrigins, constants) => {
    // Handle disabled UI state
    if (isDisabled(disabledAtAll, ignoredOrigins, constants)) {
      $body.classList.add(disabledClassName)
    } else {
      $body.classList.remove(disabledClassName)
    }
  }

  const componentInjections = import('/popup/app/components/injections.js')
  const sharedComponentInjectionsData = import('/shared-resources/components/injections.js')
  const pluginInjectionsData = import('/shared-resources/plugins/injections.js')
  const servicesInjectionsData = import('/shared-resources/services/injections.js')

  const contentAPIData = ScriptManager.injectScriptToPage('/shared-resources/core/content-script-api.js')
  const stateMutatorsData = ScriptManager.injectScriptToPage('/shared-resources/core/state-mutators.js')
  const themeControllerData = ScriptManager.injectScriptToPage('/shared-resources/core/theme-controller.js')

  const abacusLibData = ScriptManager.injectScriptToPage('/shared-resources/core/abacus-lib/abacus-lib.js')

  Promise.all([
    componentInjections,
    sharedComponentInjectionsData,
    pluginInjectionsData,
    servicesInjectionsData,

    contentAPIData,

    stateMutatorsData,
    abacusLibData,

    themeControllerData,
  ]).then(async ([res1, res2, res3, res4]) => {

    ContentScriptApi.getInitStateData().then(({ state, constants }) => {
      AbacusLib.init({
        constants,
        state,
        stateMutators: StateMutators,
        componentInjections: {
          ...res1.default,
          ...res2.default,
        },
        pluginInjections: res3.default,
        serviceInjections: res4.default,

        onStateMutation: (mutationRecord) => {
          const { prop, value, path } = mutationRecord
          const pathJoined = path.join('.')

          if (pathJoined === 'config' && prop === 'theme') {
            ThemeController.applyTheme(value)
          }

          if (pathJoined === 'config.ignoredOrigins' || (pathJoined === 'config' && prop === 'disabledAtAll')) {
            const disabledAtAll = state.config.disabledAtAll
            const ignoredOrigins = state.config.ignoredOrigins
            disabledMarkupController(disabledAtAll, ignoredOrigins, constants)
          }

          // Update state in ContentScriptApi
          ContentScriptApi.setData(mutationRecord)
        },
      })

      ThemeController.applyTheme(state.config.theme)

      const disabledAtAll = state.config.disabledAtAll
      const ignoredOrigins = state.config.ignoredOrigins
      disabledMarkupController(disabledAtAll, ignoredOrigins, constants)

      if (!state.config.onboarded) {
        StateMutators.setRoute(state, 'settings')
      }
    })

  })
})()