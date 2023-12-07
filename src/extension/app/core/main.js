import componentInjections from '../components/injections.js'

import sharedPluginInjectionsData from '/src/shared-resources/plugins/injections.js'
import sharedServicesInjectionsData from '/src/shared-resources/services/injections.js'
import sharedComponentInjectionsData from '/src/shared-resources/components/injections.js'

import '/src/shared-resources/core/abacus-lib/abacus-lib.js'
import '/src/shared-resources/core/content-script-api.js'
import '/src/shared-resources/core/state-mutators.js'
import '/src/shared-resources/core/theme-controller.js'

(async () => {
  class ConfigUtils {
    static isIgnoredOrigin = (ignoredOrigins, constants) => ignoredOrigins.includes(constants.clientInfo.origin)
    static isDisabled = (disabledAtAll, ignoredOrigins, constants) => disabledAtAll || ConfigUtils.isIgnoredOrigin(ignoredOrigins, constants)
  }

  class BodyDisabledClassNameController {
    static disabledClassName = 'disabled'
    static $body = document.body

    static handleConfigChanged = ({ disabledAtAll, ignoredOrigins }, constants) => {
      // Handle disabled UI state
      if (ConfigUtils.isDisabled(disabledAtAll, ignoredOrigins, constants)) {
        BodyDisabledClassNameController.$body.classList.add(BodyDisabledClassNameController.disabledClassName)
      } else {
        BodyDisabledClassNameController.$body.classList.remove(BodyDisabledClassNameController.disabledClassName)
      }
    }
  }


  const { state, constants } = await ContentScriptApi.getInitStateData()

  const handleStateMutation = (mutationRecord) => {
    const { prop, value, path } = mutationRecord
    const pathJoined = path.join('.')

    if (pathJoined === 'config' && prop === 'theme') {
      ThemeController.applyTheme(value)
    }

    if (pathJoined === 'config.ignoredOrigins' || (pathJoined === 'config' && prop === 'disabledAtAll')) {
      BodyDisabledClassNameController.handleConfigChanged(state.config, constants)
    }

    // Update state in ContentScriptApi
    ContentScriptApi.setData(mutationRecord)
  }

  // Abacus init
  AbacusLib.init({
    constants,
    state,
    stateMutators: StateMutators,

    componentInjections: {
      ...componentInjections,
      ...sharedComponentInjectionsData,
    },
    pluginInjections: sharedPluginInjectionsData,
    serviceInjections: sharedServicesInjectionsData,

    onStateMutation: handleStateMutation,
  })


  // Initial theme
  ThemeController.applyTheme(state.config.theme)

  // Initial body disabled class name
  BodyDisabledClassNameController.handleConfigChanged(state.config, constants)

  // Initial routing
  if (!state.config.onboarded) {
    StateMutators.setRoute(state, 'settings')
  }
})()