(() => {
  const html = ({ t }) => {
    return (
      `<pll-typography variant="title" text="${t.title}"></pll-typography>
      <pll-dictionary></pll-dictionary>`
    )
  }

  class Component extends AbacusLib.Component {
    hasTranslates = true
    html = html
    css = `
      :host {
        min-height: 0;
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
        grid-row-gap: 6px;
      }
      
      pll-typography {
        text-align: center;
      }
    `
  }
  AbacusLib.defineCustomElement('dictionary-screen', Component)
})();