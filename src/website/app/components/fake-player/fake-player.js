(() => {
  const html = ({ subtitles, imageSrc }) => {
    return (
      `<div class="root" style='background-image: url("${imageSrc}");'>
        <div class="empty"></div>
        <div class="subtitles">${subtitles}</div>
        <div class="btn-play"></div>
      </div>`
    )
  }

  class Component extends AbacusLib.Component {
    dontUseShadowDOM = true
    html = html
    css = `
    .root {
      --button-height: 28px;
    
      position: relative;
      
      width: 100%;
      height: 100%;
      
      display: grid;
      grid-template-rows: 1fr auto auto;
      grid-template-columns: 1fr;
      grid-row-gap: 8px;
      
      background-color: #000;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      box-shadow: 0 2px 1px -1px gray;
    }
    
    .subtitles {
        background-color: rgba(0, 0, 0, 0.6);
        color: #fff;
        padding: 8px;
        font-family: system-ui;
        text-align: center;
    }
    
    .btn-play {
      position: absolute;
      top: 50%;
      left: 50%;
      
      transform: translate(-50%, -50%);
      
      border-top: var(--button-height) solid transparent;
      border-bottom: var(--button-height) solid transparent;
      border-left: calc(var(--button-height) * 2 * 0.86) solid #fff;
    }
    `
  }
  AbacusLib.defineCustomElement('fake-player', Component)
})()