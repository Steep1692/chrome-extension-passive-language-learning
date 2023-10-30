(() => {
  const html = () => {
    return (
      `<pll-config></pll-config>
      <pll-dictionary></pll-dictionary>`
    )
  }

  AbacusLib.createWebComponent('dictionary-screen', {
    html,
    css: `
      :host {
        min-height: 0;
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
        grid-row-gap: 6px;
      }
    `
  })
})();