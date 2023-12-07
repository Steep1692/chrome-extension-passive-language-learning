(() => {
  const html = ({t}) => {
    return (
      `<pll-link-install
            title="${t.title}"
            image-src="/website/app/assets/images/icons/chrome.svg"
            href="https://chrome.google.com/webstore/detail/passive-language-learning/nnjgjgjgjgjgjgjgjgjgjgjgjgjgjgj"
        ></pll-link-install>`
    )
  }


  const translatesUK = {
    title: 'Встановити розширення Google Chrome',
  }

  const translatesEN = {
    title: 'Install Google Chrome Extension',
  }

  const translatesZH = {
    title: '安装谷歌浏览器扩展',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  AbacusLib.createWebComponent('install-chrome', {
    html,
    translates,
  })
})()