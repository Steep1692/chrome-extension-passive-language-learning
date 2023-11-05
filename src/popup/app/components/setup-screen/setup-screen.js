(() => {
  const html = ({ t, state }) => {
    const showBtnSubmit = !state.config.onboarded

    const $btnSubmit = showBtnSubmit ? (
      `<button is="pll-button" data-variant="submit" data-listen-on-Click="finishOnBoarding">
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
          <pll-config></pll-config>
          <pll-language-select title="${t.yourLang}"></pll-language-select>
          <pll-languages-view></pll-languages-view>
      </div>
      
      ${$btnSubmit}`
    )
  }

  AbacusLib.createWebComponent('setup-screen', {
    hasTranslates: true,

    html,
    styleFilesURLs: [
      'default',
    ],

    methods: {
      finishOnBoarding(ctx) {
        ctx.stateMutators.updateConfig({
          onboarded: true,
        })
        ctx.stateMutators.setRoute('dictionary')
      }
    },
  })
})();