(() => {
  const FAVICON_BY_DOMAIN_URL_API_URL = 'https://s2.googleusercontent.com/s2/favicons?domain_url='

  const removeUrlProtocol = (url) => url.replace(/https?:\/\//, '')

  const html = ({ t, state, constants }) => {
    const disableOnThisWebsite = state.config.ignoredOrigins.includes(constants.clientInfo.origin)
    const disableAtAll = state.config.disabledAtAll
    const origin = constants.clientInfo.origin ?? ''

    return `
      <label class="switch">
              <span class="website">
                <img src="${FAVICON_BY_DOMAIN_URL_API_URL}${origin}" alt="logo">
                ${t.disable} ${removeUrlProtocol(origin)}
              </span>
              
              <input ${disableOnThisWebsite && 'checked'} type="checkbox" data-listen-on-Change="disableOnThisWebsite">
          </label>

          <label class="switch">
                <span class="website">
                  <img src="https://cdn.icon-icons.com/icons2/1369/PNG/512/-all-inclusive_89887.png" width="16" height="16">
                  ${t.disable} ${t.allWebsites}
              </span>
              
              <input ${disableAtAll && 'checked'} type="checkbox" data-listen-on-Change="disableAtAll">
          </label>
    `
  }

  const translatesEN = {
    disable: 'DISABLE for',
    allWebsites: 'All Websites',
  }

  const translatesUK = {
    disable: 'Відключити для',
    allWebsites: 'Всіх веб-сайтів',
  }

  const translatesZH = {
    disable: '禁用',
    allWebsites: '所有网站',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  AbacusLib.createWebComponent('config', {
    translates,

    html,
    css: `
      :host {
          padding: 3px 0;
          border: 1px solid darkkhaki;
          border-radius: 8px;

          display: grid;
          width: 100%;
      
          background: rgba(255, 255, 224, 0.82);
      }
      
      img {
          width: 1em;
          height: 1em;
      }
      
      label {
          display: grid;
          justify-content: space-between;
          padding: 6px 9px;
      
          grid-column-gap: 5px;
          align-content: baseline;
          grid-template-columns: 1fr auto;
      
          font-size: 14px;
          font-weight: 700;
          text-align: left;
      
          cursor: pointer;
          user-select: none;
          transition: background-color 0.1s;
      }
      
      label:hover {
          background-color: rgba(158, 158, 158, 0.49);
      }
      
      select {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid gray;
      
          font-size: 16px;
          line-height: 1;
      
          background: url(http://cdn1.iconfinder.com/data/icons/cc_mono_icon_set/blacks/16x16/br_down.png) no-repeat right #fff;
          -webkit-appearance: none;
          background-position-x: 95%;
          background-size: 8px;
      
          cursor: pointer;
      }
      
      .website {
          display: grid;
          grid-template-columns: auto 1fr;
          align-content: center;
          grid-column-gap: 5px;
      
          word-break: break-all;
      
          color: #2b2bff;
      }
      
      input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin: 0;
      
          cursor: pointer;
      }
    `,

    methods: {
      disableOnThisWebsite(ctx, event) {
        const ignoredOriginsNew = ctx.state.config.ignoredOrigins
        const origin = ctx.constants.clientInfo.origin

        if (event.currentTarget.checked) {
          ctx.stateMutators.disableForWebsite(origin)
        } else {
          ctx.stateMutators.enableForWebsite(origin)
        }
      },
      disableAtAll: function (ctx, event) {
        if (event.currentTarget.checked) {
          ctx.stateMutators.disableAtAll()
        } else {
          ctx.stateMutators.enableAtAll()
        }
      }
    },
  })
})()