(() => {
  const html = ({ title, imageSrc }) => {
    return (
      `<a class="link" href="/extension/index.html" class="btn btn-primary" target="_blank" onclick="event.stopPropagation()">
        <img src="${imageSrc}" alt="${title}">
        <span>${title}</span>
      </a>`
    )
  }

  AbacusLib.createWebComponent('link-install', {
    html,
    css: `
      .link {
          display: flex;
          align-items: center;
          padding: 12px 24px;
          border-radius: 21px;
      
          font-size: 20px;
      
          background-color: white;
          box-shadow: 0px 0px 18px 9px #0000003b;
          color: var(--link-color);
      }
      
      .link:hover {
          background-color: #f5f5f5;
      }
      
      .link:active {
          background-color: #e5e5e5;
      }
      
      .link img {
          width: 72px;
          height: 72px;
          margin-right: 12px;
      }
    `,
  })
})()