(() => {
  const FAVICON_BY_DOMAIN_URL_API_URL = 'https://s2.googleusercontent.com/s2/favicons?domain_url='

  const html = ({ t, origin }) => {
    return `
      <div class="config">
           <label class="switch" for="config-disable-on-this-website">
              <span class="website">
                <img src="${FAVICON_BY_DOMAIN_URL_API_URL}${origin}" alt="logo">
                ${t.disable} ${origin.replace(/https?:\/\//, '')}
              </span>
              
              <input type="checkbox" id="config-disable-on-this-website">
          </label>

          <label class="switch" for="config-disable-extension">
                <span class="website">
                  <img src="https://cdn.icon-icons.com/icons2/1369/PNG/512/-all-inclusive_89887.png" width="16" height="16">
                  ${t.disable} ${t.allWebsites}
              </span>
              
              <input type="checkbox" id="config-disable-extension">
          </label>
      </div>
    `
  }

  AbacusLib.createWebComponent('config', html, {
    styleFilesURLs: ['app/views/config/config.css'],

    defineElements: function () {
      return {
        disableOnThisWebsite: this.shadowRoot.getElementById('config-disable-on-this-website'),
        disableAtAll: this.shadowRoot.getElementById('config-disable-extension'),
      }
    },

    changesOnStateChange: [
      {
        when: (state, prevState) => state.config.ignoredOrigins !== prevState.config.ignoredOrigins,
        do: function($elements, state) {
          $elements.disableOnThisWebsite.checked = state.config.ignoredOrigins.includes(this.store.clientInfo.origin)
        }
      },
      {
        when: (state, prevState) => state.config.disabledAtAll !== prevState.config.disabledAtAll,
        do: ($elements, state) => {
          $elements.disableAtAll.checked = state.config.disabledAtAll
        }
      }
    ],

    renderArgs: function () {
      return {
        t: {
          disable: 'DISABLE for',
          allWebsites: 'All Websites',
        },
        origin: this.store.clientInfo.origin ?? '',
      }
    },

    onAfterFirstRender: function () {
      this.elements.disableOnThisWebsite.addEventListener('change', (event) => {
        const { state, clientInfo } = this.store
        const { config } = state
        const { origin } = clientInfo
        const ignoredOriginsNew = config.ignoredOrigins

        if (event.target.checked) {
          ignoredOriginsNew.push(origin)
        } else {
          const index = ignoredOriginsNew.indexOf(origin)
          if (index !== -1) {
            ignoredOriginsNew.splice(index, 1)
          }
        }

        this.store.updateConfig({
          ignoredOrigins: ignoredOriginsNew,
        })
      })

      this.elements.disableAtAll.addEventListener('change', (event) => {
        this.store.updateConfig({
          disabledAtAll: event.target.checked,
        })
      })
    }
  })
})()