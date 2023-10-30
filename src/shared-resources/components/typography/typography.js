(() => {
  const html = ({ classnames, variant, text }) => {
    return (
      `<span class="${classnames('typography', variant)}">
        ${text ?? `<slot name="default"></slot>`}
      </span>`
    )
  }

  AbacusLib.createWebComponent('typography', {
    html,
    styleFilesURLs: [
      'default',
    ],
  })
})()