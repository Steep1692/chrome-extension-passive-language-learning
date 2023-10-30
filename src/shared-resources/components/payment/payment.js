(() => {
  const html = ({ url, t }) => {
    return (
      `
        <pll-qr-code url="url"></pll-qr-code>
        <a href="${url}" target="_blank" rel="noreferrer" title="${t.linkTitle}">
            <img src="/shared-resources/components/payment/logo_liqpay%20for%20white.svg" alt="">
        </a>
      `
    )
  }

  const translatesEN = {
    linkTitle: 'Pay with LiqPay',
  }

  const translatesUK = {
    linkTitle: 'Оплатити через LiqPay',
  }

  const translatesZH = {
    linkTitle: '通过LiqPay支付',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  AbacusLib.createWebComponent('payment', {
    translates,

    html,
    css: `
      :host {
        display: grid;
        grid-template-columns: 1fr;
        grid-row-gap: 20px;
        justify-items: center;
      }
      
      img {
        width: 148px;
      }
    `,
  })
})();