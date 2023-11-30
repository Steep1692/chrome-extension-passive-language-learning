(() => {
  const html = ({ t, state, localState }) => {
    const showFolders = !state.currentFolderId
    const $view = showFolders
      ? `<pll-folders-view search="${localState.search}"></pll-folders-view>`
      : `<pll-words-view search="${localState.search}"></pll-words-view>`
    
    return (
      `<input is="pll-input" type="text" placeholder="${showFolders ? t.searchFolder : t.searchWords}" data-listen-on-input="onInput">
      ${$view}`
    )
  }

  AbacusLib.createWebComponent('dictionary', {
    hasTranslates: true,

    html,
    css: `
      :host {
        display: grid;
        grid-template-rows: auto 1fr;
        grid-row-gap: 4px;
        min-height: 0;
      }
    `,

    localState: {
      search: '',
    },

    methods: {
      onInput(ctx, event) {
        ctx.mutateLocalState({
          search: event.target.value
        })
      }
    }
  })
})()