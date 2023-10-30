(() => {
  const html = function ({ t, state }) {
    return (
      `
        <pll-typography variant="title" text="${t.title}"></pll-typography>
        <pll-typography variant="subtitle" text="${t.subtitle}"></pll-typography>
        <pll-payment url="${state.constants.paymentServiceLink}"></pll-payment>
      `
    )
  }

  const translatesEN = {
    title: 'Donate',
    subtitle: 'Make a donation for Ukrainian Army',
    donate: 'Make a donation',
    qrCode: 'Scan QR-code',
    requisites: 'requisites',
    // 1. Payment service integration
    // 2. Apple Pay integration if possible
    // 3. MonoBank Bank link and image
    // 4. [Реквізити]
    // 5. QR Code
    // 6. Share the donation
  }

  const translatesUK = {
    title: 'Пожертвувати',
    subtitle: 'Зробіть пожертвування для української армії',
    donate: 'Зробити донат',
    qrCode: 'Сканувати QR-код',
    requisites: 'Реквізити',
  }

  const translatesZH = {
    title: '捐赠',
    subtitle: '为乌克兰军队捐款',
    donate: '捐赠',
    qrCode: '扫描二维码',
    requisites: '要求',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  AbacusLib.createWebComponent('donate-screen', {
    translates,

    html,
    css: `
      :host {
        display: grid;
        align-content: flex-start;
        grid-template-columns: 1fr;
        grid-row-gap: 8px;
        text-align: center;
      }
    `,
  })
})();