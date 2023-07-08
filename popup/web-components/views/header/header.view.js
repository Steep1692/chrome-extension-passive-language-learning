(() => {
  const html = `
      <pll-bubble-background>
        <header>
            <h1>Passive Language Learning</h1>
            <span class="made-in-ukraine-with-love">Made in Ukraine with love!</span>
        </header>
    </pll-bubble-background>
    `

  AbacusLib.createWebComponent('header', html, {
    styleFilesURLs: [
      'web-components/views/header/header.css',
    ],
  })
})();