(() => {
  // Code is based on the following codepen by @Paolo-Duzioni: https://codepen.io/Paolo-Duzioni/pen/MQmbJo
  const html = `<slot name="default"></slot>`

  class Component extends AbacusLib.Component {
    html = html
    styleFilesURLs = [
      'default',
    ]

    onAfterFirstRender() {
      const appendAnimationBubbles = () => {
        const $root = this.shadowRoot
        const $container = document.createElement('div')

        $container.className = 'bottom-particles'

        const $bubble = document.createElement('div')
        $bubble.classList.add('bottom-particles', 'bubble')

        for (let i = 0; i < 21; i++) {
          $container.appendChild($bubble.cloneNode(true))
        }

        $root.appendChild($container)
      }

      appendAnimationBubbles()
    }
  }

  AbacusLib.defineCustomElement('bubble-background', Component)
})()