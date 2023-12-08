(() => {
  class Component extends AbacusLib.ButtonComponent {
    extendsElement = HTMLButtonElement
    styleFilesURLs = [
      'default',
    ]
  }
  AbacusLib.defineCustomElement('button', Component, {
    extends: 'button',
  })
})()