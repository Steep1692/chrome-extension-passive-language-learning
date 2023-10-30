(() => {
  const html = () => `
    <pll-bubble-background class="wrapper">
      <button slot="default" class="splash" onclick="window.scroll({ top: window.innerHeight, behavior: 'smooth' })">
        <pll-language-select></pll-language-select>
        <pll-splash-text></pll-splash-text>
        <pll-install-chrome></pll-install-chrome>
        <span class="btn-down"></span>
        <div class="background"></div>
      </button>
    </pll-bubble-background>
  `

  AbacusLib.createWebComponent('splash', {
    html,

    styleFilesURLs: [
      'default'
    ],
  })
})()