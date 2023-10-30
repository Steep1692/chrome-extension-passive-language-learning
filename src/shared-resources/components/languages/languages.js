(() => {
  const langs = [
    { lang: 'uk', name: 'uk', },
    { lang: 'en', name: 'en', },
    { lang: 'zh', name: 'zh', },
  ]

  const html = function ({ t, state, classnames }) {
    const toLang = state.config.toLang

    const $langs = langs.map(({ lang, name }) => {
      const className = classnames("language", {
        "active": toLang === lang,
      })

      return (
        `<button class="${className}" value="${lang}" @onClick="onLanguageClick">
          <img src="/popup/images/flags/${name}.png" alt="Ukrainian">
          <span>${t[name]}</span>
        </button>`
      )
    })

    return $langs.join('')
  }

  const translatesUK = {
    uk: 'Українська',
    en: 'Англійська (English)',
    zh: 'Китайська (中文)',
  }

  const translatesEN = {
    uk: 'Ukrainian (Українська)',
    en: 'English',
    zh: 'Chinese (中文)',
  }

  const translatesZH = {
    uk: '乌克兰语 (Українська)',
    en: '英语 (English)',
    zh: '中文',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  AbacusLib.createWebComponent('languages', {
    translates,

    html,
    css: `
      :host {
          display: grid;
          align-items: flex-end;
          grid-template-columns: 1fr 1fr 1fr;
          grid-column-gap: 16px;
      }
      
      .language {
          height: 100%;
          box-sizing: border-box;

          display: grid;
          grid-template-columns: 1fr;
          justify-items: center;
          align-content: flex-start;
          grid-row-gap: 8px;

          padding: 10px;
          border: none;
          border-radius: 8px;
      
          background-color: rgb(239, 239, 239);
          box-shadow: 0 1px 3px -1px gray;
      
          transition: 0.1s;
          cursor: pointer;
      }
      
      .language:hover {
          transform: scale(1.04);
      }
      
      .language:active {
          transform: scale(0.95);
          box-shadow: 0 4px 2px -2px gray;
      }
      
      .language.active {
          background-color: var(--primary);
          color: white;
      }
      
      .language img {
          width: 64px;
          height: 42px;
      }
    `,

    methods: {
      onLanguageClick(ctx, event) {
        const value = event.currentTarget.getAttribute('value')

        this.stateMutators.updateConfig({ toLang: value })
      },
    },
  })
})()