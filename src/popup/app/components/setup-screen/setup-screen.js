(() => {
  const html = ({ t, state }) => {
    const showBtnSubmit = !state.config.onboarded

    const $btnSubmit = showBtnSubmit ? (
      `<button is="pll-button" data-variant="submit" @onClick="finishOnBoarding">
          ${t.startLearning}
          &nbsp;
          <span class="emoji-wrap">
              <span class="emoji-valid">🐻</span>
              <span class="emoji-active">👍</span>
          </span>
      </button>`
    ) : ''

    return (
      `<pll-typography variant="title" text="${t.title}"></pll-typography>
  
      <div class="content">
          <pll-language-select title="${t.yourLang}"></pll-language-select>
          <pll-languages-view></pll-languages-view>
      </div>
      
      ${$btnSubmit}`
    )
  }

  const translatesEN = {
    title: 'Settings',
    yourLang: 'Your language',
    en: 'English',
    zh: 'Chinese',
    uk: 'Ukrainian',
    startLearning: 'Start learning',
  }

  const translatesUK = {
    title: 'Налаштування',
    yourLang: 'Ваша мова',
    en: 'Англійська',
    zh: 'Китайська',
    uk: 'Українська',
    startLearning: 'Почати вивчення',
  }

  const translatesZH = {
    title: '设置',
    yourLang: '你的语言',
    en: '英语',
    zh: '中文',
    uk: '乌克兰语',
    startLearning: '开始学习',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  AbacusLib.createWebComponent('setup-screen', {
    translates,

    html,
    styleFilesURLs: [
      'default',
    ],

    methods: {
      finishOnBoarding(ctx) {
        ctx.stateMutators.updateConfig({
          onboarded: true,
        })
      }
    },
  })
})();