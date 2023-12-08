(() => {
  class Component extends AbacusLib.Component {
    dontUseShadowDOM = true
    css = `
      pll-route {
        display: contents;
      }
    `
    stateEffects = [
      function (ctx) {
        const showContent = ctx.props.path === ctx.state.router.path

        if (showContent) {
          ctx.$root.style.display = ''
        } else {
          ctx.$root.style.display = 'none'
        }
      },
    ]
  }
  AbacusLib.defineCustomElement('route', Component)
})()