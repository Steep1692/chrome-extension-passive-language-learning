(() => {
  const html = function (props) {
    const { title, subtitle, textExample, videoExample } = props
    const $textExample = (slotName) => `<template slot="${slotName}">${textExample}</template>`
    const $playerExample = (slotName) => `<template slot="${slotName}"><pll-video-player slot="${slotName}" src="/website/assets/video/video-example.mp4#t=7" track-src="${videoExample}"></pll-video-player></template>`
    const $textDemo = `<pll-demo>
      ${$textExample('card-body-1')}
      ${$textExample('card-body-2')}
    </pll-demo>`

    const $playerDemo = videoExample
      ? `<pll-demo>
            ${$playerExample('card-body-1')}
            ${$playerExample('card-body-2')}
        </pll-demo>`
      : ''

    return (
      `<div class="example">
        <div class="title">
            <h1>${title}</h1>
            <p>${subtitle}</p>
        </div>
        ${$textDemo}
        ${$playerDemo}
      </div>`
    )
  }

  const css = `
    .example {
      display: grid;
      grid-template-columns: 1fr;
      grid-row-gap: 32px;
    }
    
    .example .title {
        font-family: Skranji-Regular;
        text-align: center;
        text-shadow: -1px 0 rgba(0, 0, 0, 0.4), 0 1px rgba(0, 0, 0, 0.4), 1px 0 rgba(0, 0, 0, 0.4), 0 -1px rgba(0, 0, 0, 0.4);
    }
    
    .example .title h1 {
        font-size: 32px;
        color: var(--primary);
    }
    
    .example .title p {
        font-size: 21px;
        color: var(--secondary)
    }
    
    
    @media screen and (max-width: 768px) {
        .example .title h1 {
            font-size: 26px;
        }
    }
  `

  AbacusLib.createWebComponent('example', {
    dontUseShadowDOM: true,

    html,
    css,
  })
})()