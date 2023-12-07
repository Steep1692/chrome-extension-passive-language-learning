(() => {
  const html = ({ t }) => {
    return (
      `<pll-typography variant="title" text="${t.title}"></pll-typography>
      <pll-dictionary></pll-dictionary>`
    )
  }

  AbacusLib.createWebComponent('dictionary-screen', {
    hasTranslates: true,

    html,
    css: `
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
  })
})();