(() => {
  const PREFIX = 'pll'

  const injectionsCache = {}

  const moduleNameToURL = {
    'Content-script-api': './content-script-api.js',
    'Store': './store.js',
    'Router': './router.js',
    'Translator': './translator.js',
  }

  // Don't show possibly broken HTML–markup until all styles are loaded
  const dontShowHtmlUntilAllCssLoaded = (shadowRoot, styleFilesURLs) => {
    let linksLoaded = 0
    for (const url of styleFilesURLs) {
      const $link = document.createElement('link')
      $link.rel = 'stylesheet'
      $link.href = url
      $link.addEventListener('load', () => {
        linksLoaded += 1

        if (linksLoaded === styleFilesURLs.length) {
          shadowRoot.children[0].style.display = ''
        }
      })
      shadowRoot.appendChild($link)
    }
  }

  const injectModule = async (moduleName) => {
    if (!moduleNameToURL[moduleName]) {
      throw new Error(`Module ${moduleName} not found. Allowed modules: ${Object.keys().join(', ')}`)
    }

    if (injectionsCache[moduleName]) {
      return injectionsCache[moduleName]
    }

    const module = await import(moduleNameToURL[moduleName])
    injectionsCache[moduleName] = module.default
    return injectionsCache[moduleName]
  }

  const createWebComponent = (name, renderHTML, {
    styleFilesURLs,
    renderArgs,
    onAfterFirstRender,
    onStateChange,
    defineElements,
    changesOnStateChange,
    injections,
  }) => {
    class AbacusComponent extends HTMLElement {
      constructor() {
        super()
        this.store = Store

        if (injections) {
          this.injections = {}

          for (const injection of injections) {
            const promise = injectModule(injection)
            this.injections[injection] = promise
            promise.then((module) => {
              this.injections[injection] = module
            })
          }
        }

        this.attachShadow({ mode: 'open' })
      }

      async connectedCallback() {
        this.store.subscribeToState((state, prevState, clarifications) => {
          if (clarifications.init) {
            this.render(typeof renderArgs === 'function' ? renderArgs.call(this, state) : (renderArgs ?? state))
            this.elements = defineElements?.call(this)
            dontShowHtmlUntilAllCssLoaded(this.shadowRoot, styleFilesURLs)
            onAfterFirstRender?.call(this, state, prevState)
          }

          onStateChange?.call(this, state, prevState)

          if (changesOnStateChange) {
            for (const change of changesOnStateChange) {
              if (clarifications.init || change.when(state, prevState)) {
                change.do.call(this, this.elements, state, prevState)
              }
            }
          }
        })
      }

      render(...args) {
        const html = typeof renderHTML === 'string' ? renderHTML : renderHTML(...args)

        this.shadowRoot.innerHTML = `
          <div style="display: none;">
            ${html}
          </div>
        `
      }
    }

    customElements.define(PREFIX + '-' + name, AbacusComponent)
  }

  window.AbacusLib = {
    createWebComponent,
  }
})()