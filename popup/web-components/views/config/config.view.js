(() => {
  const FAVICON_BY_DOMAIN_URL_API_URL = 'https://s2.googleusercontent.com/s2/favicons?domain_url='

  const html = ({ t, origin }) => {
    return `
      <div class="config">
<!--          <div class="title">-->
<!--            <img src="images/gear.png">-->

<!--          </div>-->
          
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
          
          
<!--          <div class="row">-->
<!--         -->
<!--          </div>-->

<!--          <div class="row">-->
<!--          <label for="select-lang-original">-->
<!--              Replace:-->
<!--              <select id="select-lang-original">-->
<!--                  <option value="uk">Ukrainian</option>-->
<!--                  <option value="en">English</option>-->
<!--                  <option value="zh">Chinese</option>-->
<!--              </select>-->
<!--          </label>-->

<!--          <label for="select-lang-translation">-->
<!--              I learn…-->
<!--              <select id="select-lang-translation">-->
<!--                  <option value="en">English</option>-->
<!--                  <option value="zh">Chinese</option>-->
<!--                  <option value="uk">Ukrainian</option>-->
<!--              </select>-->
<!--          </label>-->
<!--        </div>-->
      </div>
    `
  }

  AbacusLib.createWebComponent('config', html, {
    styleFilesURLs: ['web-components/views/config/config.css'],

    defineElements: function () {
      return {
        // langFrom: this.shadowRoot.getElementById('select-lang-original'),
        // langTo: this.shadowRoot.getElementById('select-lang-translation'),
        disableOnThisWebsite: this.shadowRoot.getElementById('config-disable-on-this-website'),
        disableAtAll: this.shadowRoot.getElementById('config-disable-extension'),
      }
    },

    changesOnStateChange: [
      {
        when: (state, prevState) => state.config.ignoredOrigins !== prevState.config.ignoredOrigins,
        do: ($elements, state) => {
          $elements.disableOnThisWebsite.checked = state.config.ignoredOrigins.includes(origin)
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
      const onChange = this.store.updateConfig
      // $langFrom.addEventListener('change', (event) => {
      //   onChange({
      //     fromLang: event.target.value,
      //   })
      // })
      // $langTo.addEventListener('change', (event) => {
      //   onChange({
      //     toLang: event.target.value,
      //   })
      // })
      this.$elements.disableOnThisWebsite.addEventListener('change', (event) => {
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

        onChange({
          ignoredOrigins: ignoredOriginsNew,
        })
      })
      this.$elements.disableAtAll.addEventListener('change', (event) => {
        onChange({
          disabledAtAll: event.target.checked,
        })
      })
    }
  })
})()