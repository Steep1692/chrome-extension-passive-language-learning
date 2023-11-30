(() => {
  const FAVICON_BY_DOMAIN_URL_API_URL = 'https://s2.googleusercontent.com/s2/favicons?domain_url='

  const removeUrlProtocol = (url) => url.replace(/https?:\/\//, '')

  const html = ({ t, state, constants }) => {
    const origin = constants.clientInfo.origin ?? ''
    const disableOnThisWebsite = state.config.ignoredOrigins.includes(origin)
    const disableAtAll = state.config.disabledAtAll
    const pronounceWord = state.config.pronounceWord
    const highlightWords = state.config.highlightWords

    return `
        <pll-checkbox
            checked="${disableOnThisWebsite}"
            label="${t.disable + ' ' + removeUrlProtocol(origin)}"
            icon-src="${FAVICON_BY_DOMAIN_URL_API_URL}${origin}"
            data-listen-on-change="disableOnThisWebsite"
        ></pll-checkbox>

        <pll-checkbox
            checked="${disableAtAll}"
            label="${t.disable + ' ' + t.allWebsites}"
            icon-src="https://cdn.icon-icons.com/icons2/1369/PNG/512/-all-inclusive_89887.png"
            data-listen-on-change="disableAtAll"
        ></pll-checkbox>

        <hr>
        
        <pll-checkbox
            checked="${pronounceWord}"
            label="${t.pronounceWord}"
            icon-src="/popup/app/components/config/speaker${pronounceWord ? '' : '-muted'}.svg"
            data-listen-on-change="changePronounceWord"
        ></pll-checkbox>
          
        <pll-checkbox
            checked="${highlightWords}"
            label="${t.highlightWords}"
            icon-src="/popup/app/components/config/highlight-${highlightWords ? 'on' : 'off'}.svg"
            data-listen-on-change="changeHighlightWords"
        ></pll-checkbox>
        <hr>
        <pll-colors-settings></pll-colors-settings>
    `
  }

  const translatesEN = {
    disable: 'DISABLE for',
    allWebsites: 'All Websites',

    pronounceWord: 'Pronounce word on mouse hover',
    highlightWords: 'Highlight words',
  }

  const translatesUK = {
    disable: 'Відключити для',
    allWebsites: 'Всіх веб-сайтів',

    pronounceWord: 'Вимовляти слово при наведенні миші',
    highlightWords: 'Підсвічувати слова',
  }

  const translatesZH = {
    disable: '禁用',
    allWebsites: '所有网站',

    pronounceWord: '鼠标悬停时发音',
    highlightWords: '高亮显示单词',
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
      
      hr {
          width: 100%;
          background: darkkhaki;
          height: 1px;
          border: none;
      }
    `,

    methods: {
      disableOnThisWebsite(ctx, event) {
        const ignoredOriginsNew = ctx.state.config.ignoredOrigins
        const origin = ctx.constants.clientInfo.origin

        if (event.detail.checked) {
          ctx.stateMutators.disableForWebsite(origin)
        } else {
          ctx.stateMutators.enableForWebsite(origin)
        }
      },
      disableAtAll: function (ctx, event) {
        if (event.detail.checked) {
          ctx.stateMutators.disableAtAll()
        } else {
          ctx.stateMutators.enableAtAll()
        }
      },

      changePronounceWord: (ctx, event) => {
        ctx.stateMutators.changePronounceWord(event.detail.checked)
      },

      changeHighlightWords: (ctx, event) => {
        ctx.stateMutators.changeHighlightWords(event.detail.checked)
      },
    },
  })
})()