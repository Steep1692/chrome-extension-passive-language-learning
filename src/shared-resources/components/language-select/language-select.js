(() => {
  const langs = [
    { lang: 'uk', name: 'uk', },
    { lang: 'en', name: 'en', },
    { lang: 'zh', name: 'zh', },
  ]

  const html = ({t, classnames, title, state}) => {
    const language = state.config.lang

    const $langs = langs.map(({ lang, name }) => {
      const className = classnames("language", {
        "active": language === lang,
      })

      return (
        `<button class="${className}" value="${lang}" data-listen-on-Click="onLanguageClick">
          <img src="/popup/images/flags/${name}.png" alt="Ukrainian">
          <span>${t[name]}</span>
        </button>`
      )
    })

    return (
      `<div class="language-select">
        ${title ? `<pll-typography variant="subtitle" text="${title}"></pll-typography>` : ''}
        <div class="language-select-items">
          ${$langs.join('')}
        </div>
      </div>`
    )
  }

  const translatesUK = {
    uk: 'Укр',
    en: 'Eng',
    zh: '中文',
  }

  const translates = {
    en: translatesUK,
    uk: translatesUK,
    zh: translatesUK,
  }

  AbacusLib.createWebComponent('language-select', {
    translates,

    html,
    css: `
      .language-select {
        display: grid;
        grid-row-gap: 16px;
      }
    
      .language-select-items {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-column-gap: 16px;
      }
      
      .language {
          position: relative;
          
          box-sizing: border-box;
          overflow: hidden;
          width: 64px;
          height: 64px;
          padding: 10px;
          border-radius: 50%;
          border: 4px solid transparent;
      
          box-shadow: 0px 0px 6px 6px #00000014;

          cursor: pointer;
          transition: 0.1s;
      }
      
      .language.active {
          border-color: var(--primary);
          color: white;
      }
      
      .language img {
          position: absolute;
          top: 50%;
          left: 0;

          width: 92px;
          height: 64px;

          transform: translateY(-50%);
      }
      
      .language:hover {
          transform: scale(1.04);
      }
       
      .language:active {
        transform: scale(0.95);
        box-shadow: 0 4px 2px -2px gray;
      }
    `,

    methods: {
      onLanguageClick(ctx, event) {
        event.stopPropagation()

        const value = event.currentTarget.getAttribute('value')

        this.stateMutators.updateConfig({ lang: value, fromLang: value, theme: value })
      }
    },
  })
})()