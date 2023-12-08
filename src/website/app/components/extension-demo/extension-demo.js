(() => {
  const html = function ({t}) {
    return (
      `
   <div class="extension-demo ">
        <button class="head" onclick="this.getRootNode().querySelector('.extension-demo').classList.toggle('collapsed')">
            <span></span>
            <span class="title">${t.title}</span>
            <span class="icon"></span>
        </button>
        <div class="body">
            <pll-dictionary></pll-dictionary>
        </div>
    </div>
  `)
  }

  const translatesUK = {
    title: 'Жива демо-версія розширення',
  }

  const translatesEN = {
    title: 'Extension Demo',
  }

  const translatesZH = {
    title: '扩展演示',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  class Component extends AbacusLib.Component {
    html = html
    translates = translates
    styleFilesURLs = [
      'default',
    ]
  }
  AbacusLib.defineCustomElement('extension-demo', Component)
})()