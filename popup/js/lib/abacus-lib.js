(() => {
  const PREFIX = 'pll'

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

  const createWebComponent = (name, renderHTML, {
    styleFilesURLs,
    renderArgs,
    onAfterFirstRender,
    onStateChange,
    defineElements,
    changesOnStateChange,
  }) => {
    class AbacusComponent extends HTMLElement {
      constructor() {
        super()
        this.store = Store
        this.attachShadow({ mode: 'open' })
      }

      async connectedCallback() {
        Store.subscribeToState((state, prevState, clarifications) => {
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