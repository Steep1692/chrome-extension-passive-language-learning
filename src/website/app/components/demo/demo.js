(() => {
  const html = () => {
    return (
      `<div class="demo">
        <pll-card pll-no-replace>
          <template slot="default">
            <slot name="card-body-1"></slot>
          </template>
        </pll-card>

        <div class="transition-icon"></div>

        <pll-card>
          <template slot="default">
            <slot name="card-body-2"></slot>
          </template>
        </pll-card>
      </div>`
    )
  }

  const css = `
    .demo {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        grid-column-gap: 32px;
        justify-items: center;
        align-items: center;
    }
    
    .demo .transition-icon {
        width: 50px;
        height: 50px;
        
        background-image: url("/website/app/assets/images/icons/transition-icon.png");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        
        animation: arrow-bounce-right 1s infinite;
    }
    
    @keyframes arrow-bounce-right {
        0% {
            transform: translateX(0);
        }
        50% {
            transform: translateX(4px);
        }
        100% {  
            transform: translateX(0);
        }
    }
    
    @media screen and (max-width: 768px) {
        .demo {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto 1fr;
        }
    }
    `

  AbacusLib.createWebComponent('demo', {
    dontUseShadowDOM: true,

    html,
    css,
  })
})()