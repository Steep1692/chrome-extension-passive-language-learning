(() => {
  const html = ({ t, state }) => {
    return (
      `
      <div>
        <input type="color" id="input" value="${state.config.highlightTranslationBgColor}" data-listen-on-change="changeHighlightTranslationBgColor" />
        <label for="input">${t.wordsHighlightBackgroundColor}</label>
      </div>
      
      <div>
        <input type="color" id="input" value="${state.config.highlightTranslationColor}" data-listen-on-change="changeHighlightTranslationColor" />
        <label for="input">${t.wordsHighlightTextColor}</label>
      </div>
      `
    )
  }

  class ColorsSettingsComponent extends AbacusLib.Component {
    hasTranslates = true
    styleFilesURLs = [
      'default',
    ]
    html = html

    methods = {
      changeHighlightTranslationBgColor: (ctx, event) => {
        this.stateMutators.changeHighlightTranslationBgColor(event.target.value)
      },
      changeHighlightTranslationColor: (ctx, event) => {
        this.stateMutators.changeHighlightTranslationColor(event.target.value)
      }
    }
  }

  AbacusLib.defineCustomElement('colors-settings', ColorsSettingsComponent)
})()