(async () => {
  const websiteComponentsPath = '/website/app/components/'

  const componentInjections = {
    Card: websiteComponentsPath + 'card/card.js',
    Demo: websiteComponentsPath + 'demo/demo.js',
    Example: websiteComponentsPath + 'example/example.js',
    ExtensionDemo: websiteComponentsPath + 'extension-demo/extension-demo.js',
    LinkInstall: websiteComponentsPath + 'link-install/link-install.js',
    InstallChrome: websiteComponentsPath + 'install-chrome/install-chrome.js',
    Examples: websiteComponentsPath + 'examples/examples.js',
    Outro: websiteComponentsPath + 'outro/outro.js',
    Splash: websiteComponentsPath + 'splash/splash.js',
    FakePlayer: websiteComponentsPath + 'fake-player/fake-player.js',
    VideoPlayer: websiteComponentsPath + 'video-player/video-player.js',
  }

  class ScriptManager {
    static injectScriptToPage = (src) => {
      const n = document.createElement('script')
      n.src = src

      // {async = false} because by default it is {true},
      // but we need to preserve the behaviour like when writing in "index.html" <script> explicitly,
      // so we change it back {async = false}
      n.async = false
      // ===============================================================

      document.body.append(n)

      return new Promise((resolve) => {
        n.onload = resolve
      })
    }
  }

  const sharedComponentInjectionsData = import('/shared-resources/components/injections.js')
  const pluginInjectionsData = import('/shared-resources/plugins/injections.js')

  const contentScriptBridgeData = ScriptManager.injectScriptToPage('/website/app/core/content-script-bridge.js')
  const contentData = ScriptManager.injectScriptToPage('/shared-resources/core/content.js')
  const contentAPIData = ScriptManager.injectScriptToPage('/shared-resources/core/content-script-api.js')

  const stateMutatorsData = ScriptManager.injectScriptToPage('/shared-resources/core/state-mutators.js')

  const abacusLibData = ScriptManager.injectScriptToPage('/shared-resources/core/abacus-lib.js')

  const themeControllerData = ScriptManager.injectScriptToPage('/shared-resources/core/theme-controller.js')

  Promise.all([
    sharedComponentInjectionsData,
    pluginInjectionsData,

    contentScriptBridgeData,
    contentData,
    contentAPIData,

    stateMutatorsData,

    abacusLibData,

    themeControllerData,
  ]).then(([res1, res2]) => {
    ContentScriptApi.getData().then(({ state }) => {
      AbacusLib.init({
        state,
        stateMutators: StateMutators,

        componentInjections: {
          ...componentInjections,
          ...res1.default,
        },
        pluginInjections: res2.default,

        onStateMutation: (mutatorName, ...args) => {
          // Update theme when {config.theme} is changed
          if (mutatorName === 'updateConfig') {
            const [payload] = args
            if (payload.theme) {
              ThemeController.applyTheme(payload.theme)
            }
          }

          // Update state in ContentScriptApi
          ContentScriptApi.setData(state)
        },
      })

      ThemeController.applyTheme(state.config.theme)
    })

  })
})()