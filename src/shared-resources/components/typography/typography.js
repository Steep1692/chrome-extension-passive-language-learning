(() => {
  const html = ({ classnames, variant, text }) => {
    return (
      `<span class="${classnames('typography', variant)}">
        ${text ?? `<slot name="default"></slot>`}
      </span>`
    )
  }

  class Component extends AbacusLib.Component {
    html = html
    styleFilesURLs = [
      'default',
    ]
  }
  AbacusLib.defineCustomElement('typography', Component)
})()