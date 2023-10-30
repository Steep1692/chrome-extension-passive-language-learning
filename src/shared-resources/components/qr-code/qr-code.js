(() => {
  const QR_SIZE = 192

  const appendQrCode = async function () {
    await this.plugins.QrCode

    new QRCode(this.$root, {
      text: this.props.url,
      width: QR_SIZE,
      height: QR_SIZE,
    });
  }

  const translatesEN = {
    linkTitle: 'Visit QR-code link',
  }

  const translatesUK = {
    linkTitle: 'Відвідати посилання QR-коду',
  }

  const translatesZH = {
    linkTitle: '访问QR码链接',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  AbacusLib.createWebComponent('qr-code', {
    translates,

    css: `
      :host {
        display: grid;
        grid-template-columns: 1fr;
        grid-row-gap: 6px;
        justify-items: center;
      }
    
      a {
        font-size: 1.4rem;
      }
    `,

    plugins: ['QrCode'],

    onAfterFirstRender: appendQrCode,
    onAttributesChange: appendQrCode,
  })
})();