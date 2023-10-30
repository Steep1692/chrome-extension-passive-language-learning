(() => {
  const html = ({ state }) => {
    return state.currentFolderId ? `<pll-words-view></pll-words-view>` : `<pll-folders-view></pll-folders-view>`
  }

  AbacusLib.createWebComponent('dictionary', {
    html,
    css: `
      :host {
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
    `
  })
})()