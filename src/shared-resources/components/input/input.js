(() => {
  class Component extends AbacusLib.Component {
    extendsElement = HTMLInputElement
    styleFilesURLs = [
      'default',
    ]
  }
  AbacusLib.defineCustomElement('input', Component)
})()