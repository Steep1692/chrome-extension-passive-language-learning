import componentInjections from '../components/injections.js'

import sharedPluginInjectionsData from '/src/shared-resources/plugins/injections.js'
import sharedComponentInjectionsData from '/src/shared-resources/components/injections.js'

import '/src/website/app/core/content-script-bridge.js'
import '/src/shared-resources/core/content.js'
import '/src/shared-resources/core/content-script-api.js'
import '/src/shared-resources/core/state-mutators.js'
import '/src/shared-resources/core/abacus-lib/abacus-lib.js'
import '/src/shared-resources/core/theme-controller.js'

const main = async () => {
  const { state } = await ContentScriptApi.getInitStateData()

  const handleStateMutation = (mutationRecord) => {
    const { prop, value, path } = mutationRecord
    const pathJoined = path.join('.')

    if (pathJoined === 'config' && prop === 'theme') {
      ThemeController.applyTheme(value)
    }

    // Update state in ContentScriptApi
    ContentScriptApi.setData(mutationRecord)
  }

  // Init Abacus
  AbacusLib.init({
    state,
    stateMutators: StateMutators,

    componentInjections: {
      ...componentInjections,
      ...sharedComponentInjectionsData,
    },
    pluginInjections: sharedPluginInjectionsData,

    onStateMutation: handleStateMutation,
  })

  // Set {onboarded} status to {true} right away,
  // since we don't have an onboarding screen
  // in the Extension Demo on the Website
  StateMutators.changeOnBoardedStatus(state, true)

  // Initial theme
  ThemeController.applyTheme(state.config.theme)
}

// Put it in setTimeout so "content.js" will be executed first, and then bridge and its API
setTimeout(main, 0)