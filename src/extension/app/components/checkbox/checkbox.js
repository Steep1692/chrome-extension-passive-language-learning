(() => {
  const html = ({ label, checked, iconSrc }) => {
    const checkedBool = checked === 'true'

    return `
      <label class="${checkedBool ? 'checked' : ''}">
          <span class="website">
            <img src="${iconSrc}">
            ${label}
          </span>
          
          <input ${checkedBool ? 'checked' : ''} type="checkbox" data-listen-on-Change="onChange">
      </label>
    `
  }

  class CheckboxComponent extends AbacusLib.Component {
    html = html
    css = `      
      label {
          display: grid;
          justify-content: space-between;
          padding: 6px 9px;
      
          grid-column-gap: 5px;
          align-content: baseline;
          grid-template-columns: 1fr auto;
      
          font-size: 14px;
          font-weight: 700;
          text-align: left;
      
          cursor: pointer;
          user-select: none;
          transition: background-color 0.1s;
      }
      
      label.checked {
          text-decoration: underline;
      }

      label:hover {
          background-color: rgba(158, 158, 158, 0.49);
      }
      
      img {
          margin-left: 6px;
          margin-right: 10px;
          width: 1.4em;
          height: 1.4em;
      }
      
      .website {
          display: grid;
          grid-template-columns: auto 1fr;
          align-content: center;
          align-items: center;
      
          word-break: break-all;
      
          color: #2b2bff;
      }
      
      input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin: 0;
      
          cursor: pointer;
      }
      `

    methods = {
      onChange: (ctx, event) => {
        console.log('custom change')
        console.dir(this.$root)
        this.$root.host.dispatchEvent(new CustomEvent('change', {
          detail: {
            checked: event.target.checked,
          }
        }))
      }
    }
  }

  AbacusLib.defineCustomElement('checkbox', CheckboxComponent)
})()