(() => {
  const html = `
    <div class="card">
      <div class="card-header">
          <div class="circles">
              <div class="c"></div>
              <div class="c"></div>
              <div class="c"></div>
          </div>

          <div class="browser">
              <div class="chevrons">
                  <svg viewBox="0 0 20 20" height="16" width="16" xmlns="http://www.w3.org/2000/svg"
                       data-name="20" id="_20">
                      <path transform="translate(6.25 3.75)"
                            d="M0,6.25,6.25,0l.875.875L1.75,6.25l5.375,5.375L6.25,12.5Z" id="Fill"></path>
                  </svg>
                  <svg viewBox="0 0 20 20" height="16" width="16" xmlns="http://www.w3.org/2000/svg"
                       data-name="20" id="_20">
                      <path transform="translate(6.625 3.75)"
                            d="M7.125,6.25.875,12.5,0,11.625,5.375,6.25,0,.875.875,0Z" id="Fill"></path>
                  </svg>
              </div>
              <div class="search-bar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="7.89" height="7.887"
                       viewBox="0 0 16.89 16.887">
                      <path id="Fill"
                            d="M16.006,16.887h0l-4.743-4.718a6.875,6.875,0,1,1,.906-.906l4.719,4.744-.88.88ZM6.887,1.262a5.625,5.625,0,1,0,5.625,5.625A5.631,5.631,0,0,0,6.887,1.262Z"
                            transform="translate(0.003 0)"></path>
                  </svg>

                  example.com
                  <div>
                  </div>

              </div>
          </div>
      </div>
      <div class="body">
          <slot name="default"></slot>
      </div
  </div>
  `

  class Component extends AbacusLib.Component {
    dontUseShadowDOM = true
    html = html
    css = `
      .card {
          width: 300px;
          height: 254px;
      
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr;
      
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          overflow: hidden;
      }
      
      .card-header  {
          box-sizing: border-box;
          overflow: hidden;
          display: grid;
          grid-template-columns: auto 1fr;
          padding: 6px;
          background: lightgrey;
      }
      
      .card .circles,
      .card .browser {
          box-sizing: border-box;
          height: 30px;
          display: flex;
          align-items: center;
      }
      
      .card .circles {
          gap: 8px;
          padding: 10px;
      }
      
      .card .c {
          width: 09px;
          height: 9px;
          border-radius: 50%;
          box-shadow: inset 2px 2px 5px rgba(235, 235, 235, 0.356);
      }
      
      .card .c:first-child {
          background-color: red;
      }
      
      .card .c:nth-child(2) {
          background-color: rgb(204, 167, 4);
      }
      
      .card .c:last-child {
          background-color: green;
      }
      
      .card .browser {
          padding: 5px;
          display: flex;
          gap: 10px;
      }
      
      .card .chevrons {
          display: flex;
      }
      
      .card .search-bar {
          position: relative;
          border: 0.5px solid black;
          border-radius: 5px;
          padding: 5px;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: rgb(88, 88, 88);
          box-shadow: inset 2px 2px 2px #05050525;
      }
      
      .card .search-bar svg {
          position: absolute;
          left: 10px;
      }
      
      .card .body {
          padding: 10px;
          background-color: white;
      }
    `
  }
  AbacusLib.defineCustomElement('card', Component)
})()