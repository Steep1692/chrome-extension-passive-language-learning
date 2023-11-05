(() => {
  const html = ({ t, state, localState }) => {
    const $view = state.currentFolderId
      ? `<pll-words-view search="${localState.search}"></pll-words-view>`
      : `<pll-folders-view search="${localState.search}"></pll-folders-view>`
    
    return (
      `<input is="pll-input" type="text" placeholder="${t.searchPlaceholder}" data-listen-on-input="onInput">
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
        ctx.setLocalState({
          search: event.target.value
        })
      }
    }
  })
})()