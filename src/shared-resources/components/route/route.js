(() => {
  AbacusLib.createWebComponent('route', {
    dontUseShadowDOM: true,
    css: `
      pll-route {
        display: contents;
      }
    `,
    stateEffects: [
      function (ctx) {
        const showContent = ctx.props.path === ctx.state.router.path

        if (showContent) {
          ctx.$root.style.display = ''
        } else {
          ctx.$root.style.display = 'none'
        }
      },
    ]
  })
})()