(() => {
  const html = ({t}) => `
    <pll-typography variant="subtitle" text="${t.learnLanguage}"></pll-typography>
    <pll-languages></pll-languages>
  `

  const translatesUK = {
    learnLanguage: 'Мова, яку ви хочете вивчити',
  }

  const translatesEN = {
    learnLanguage: 'Language you want to learn',
  }

  const translatesZH = {
    learnLanguage: '您想学习的语言',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  class Component extends AbacusLib.Component {
    html = html
    translates = translates
    css = `
      :host {
          display: grid;
          justify-content: center;
          grid-row-gap: 16px;
      }
    `
  }
  AbacusLib.defineCustomElement('languages-view', Component)
})()