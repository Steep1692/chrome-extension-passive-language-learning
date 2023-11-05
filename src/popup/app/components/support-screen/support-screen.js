(() => {
  const html = ({ t }) => {
    return (
      `<pll-typography variant="title" text="${t.title}"></pll-typography>
      <pll-typography variant="body" text="${t.subtitle}"></pll-typography>
      <iframe src="https://fs6.formsite.com/6WZf6v/lpeym893xo/index" frameborder="0"></iframe>`
    )
  }

  const translatesEN = {
    title: 'Support',
    subtitle: 'If you have any questions, suggestions or found a bug, please let us know.',
    yourName: 'Your name',
    yourEmail: 'Your email so we can contact you',
    yourMessage: 'Describe your problem',
    send: 'Send',
  }

  const translatesUK = {
    title: 'Підтримка',
    subtitle: 'Якщо у вас є які-небудь питання, пропозиції або ви знайшли помилку, будь ласка, дайте нам знати.',
    yourName: 'Ваше ім\'я',
    yourEmail: 'Ваш email щоб ми могли з вами зв\'язатися',
    yourMessage: 'Опишіть вашу проблему',
    send: 'Надіслати',
  }

  const translatesZH = {
    title: '支持',
    subtitle: '如果您有任何疑问，建议或发现错误，请告诉我们。',
    yourName: '你的名字',
    yourEmail: '您的电子邮件，以便我们与您联系',
    yourMessage: '描述你的问题',
    send: '发送',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  AbacusLib.createWebComponent('support-screen', {
    translates,

    html,
    css: `
      :host {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto auto 1fr;
        grid-row-gap: 6px;
        text-align: center;
      }
      
      iframe {
        width: 100%;
        height: 100%;
      }
      
      iframe .segment_header {
        display: none;
      }
    `,
  })
})();