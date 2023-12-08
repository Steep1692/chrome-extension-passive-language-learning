(() => {
  const html = ({ t, state }) => {
    return (
      `<h1>${t.title}</h1>
      <span class="made-in-ukraine-with-love">
        ${t.madeIn}!
        <span class="heart">♡</span>
      </span>`
    )
  }

  const translatesUK = {
    title: 'Пасивне Вивчення Мови',
    madeIn: 'Зроблено в Україні з любов\'ю',
  }

  const translatesEN = {
    title: 'Passive Language Learning',
    madeIn: 'Made in Ukraine with love',
  }

  const translatesZH = {
    title: '被动语言学习',
    madeIn: '在乌克兰用爱制作',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  class Component extends AbacusLib.Component {
    translates = translates
    html = html
    css = `
      :host {
          box-sizing: border-box;
          height: 100%;
          padding: 0 12px;
          margin: 0;
      
          display: grid;
          align-items: center;
          justify-content: center;
      
          text-align: center;
      
          color: white;
      
          font-family: CherryBombOne-Regular;
      }
      
      h1 {
          font-weight: 400;
          letter-spacing: 0.1em;
          font-size: 1.5em;
          text-shadow: -1px 0 rgba(0, 0, 0, 0.4), 0 1px rgba(0, 0, 0, 0.4), 1px 0 rgba(0, 0, 0, 0.4), 0 -1px rgba(0, 0, 0, 0.4);
          margin: 0;
          opacity: 0.9;
      }
      
      .made-in-ukraine-with-love {
          font-size: 0.9em;
      
          color: #fff;
          text-shadow: -1px 0 rgba(0, 0, 0, 0.4), 0 1px rgba(0, 0, 0, 0.4), 1px 0 rgba(0, 0, 0, 0.4), 0 -1px rgba(0, 0, 0, 0.4);
      }
      
      .made-in-ukraine-with-love .heart {
          color: #f36060;
      }

    `
  }

  AbacusLib.defineCustomElement('splash-text', Component)
})()