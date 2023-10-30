(() => {
  // Code is based on the following codepen by @Paolo-Duzioni: https://codepen.io/Paolo-Duzioni/pen/MQmbJo
  const html = `<slot name="default"></slot>`

  const css = `
      :host {
        position: relative;
        overflow: hidden;
      }
      
      .bottom-particles {
        position: absolute;
        bottom: 50%;
        left: 0;
        width: 100%;
        opacity: 0.5;
      }
      .bottom-particles .bubble {
        opacity: 0;
        position: absolute;
        bottom: -1rem;
        width: 1rem;
        height: 1rem;
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
      }
      .bottom-particles .bubble:nth-child(1) {
        left: 69%;
        animation: blow 10113ms infinite;
        animation-delay: 10827ms;
      }
      .bottom-particles .bubble:nth-child(2) {
        left: 26%;
        animation: blow 5000ms infinite;
        animation-delay: 3820ms;
      }
      .bottom-particles .bubble:nth-child(3) {
        left: 83%;
        animation: blow 9763ms infinite;
        animation-delay: 8131ms;
      }
      .bottom-particles .bubble:nth-child(4) {
        left: 98%;
        animation: blow 5000ms infinite;
        animation-delay: 10233ms;
      }
      .bottom-particles .bubble:nth-child(5) {
        left: 23%;
        animation: blow 13257ms infinite;
        animation-delay: 10682ms;
      }
      .bottom-particles .bubble:nth-child(6) {
        left: 69%;
        animation: blow 14953ms infinite;
        animation-delay: 6305ms;
      }
      .bottom-particles .bubble:nth-child(7) {
        left: 76%;
        animation: blow 14583ms infinite;
        animation-delay: 7868ms;
      }
      .bottom-particles .bubble:nth-child(8) {
        left: 79%;
        animation: blow 13545ms infinite;
        animation-delay: 8006ms;
      }
      .bottom-particles .bubble:nth-child(9) {
        left: 36%;
        animation: blow 5000ms infinite;
        animation-delay: 11881ms;
      }
      .bottom-particles .bubble:nth-child(10) {
        left: 72%;
        animation: blow 9535ms infinite;
        animation-delay: 4548ms;
      }
      .bottom-particles .bubble:nth-child(11) {
        left: 78%;
        animation: blow 14960ms infinite;
        animation-delay: 8644ms;
      }
      .bottom-particles .bubble:nth-child(12) {
        left: 6%;
        animation: blow 12415ms infinite;
        animation-delay: 1066ms;
      }
      .bottom-particles .bubble:nth-child(13) {
        left: 59%;
        animation: blow 5000ms infinite;
        animation-delay: 3018ms;
      }
      .bottom-particles .bubble:nth-child(14) {
        left: 42%;
        animation: blow 5000ms infinite;
        animation-delay: 480ms;
      }
      .bottom-particles .bubble:nth-child(15) {
        left: 16%;
        animation: blow 5000ms infinite;
        animation-delay: 2264ms;
      }
      .bottom-particles .bubble:nth-child(16) {
        left: 66%;
        animation: blow 5000ms infinite;
        animation-delay: 2722ms;
      }
      .bottom-particles .bubble:nth-child(17) {
        left: 81%;
        animation: blow 10069ms infinite;
        animation-delay: 2328ms;
      }
      .bottom-particles .bubble:nth-child(18) {
        left: 95%;
        animation: blow 5000ms infinite;
        animation-delay: 8395ms;
      }
      .bottom-particles .bubble:nth-child(19) {
        left: 52%;
        animation: blow 5000ms infinite;
        animation-delay: 3008ms;
      }
      .bottom-particles .bubble:nth-child(20) {
        left: 68%;
        animation: blow 12589ms infinite;
        animation-delay: 8339ms;
      }
      .bottom-particles .bubble:nth-child(21) {
        left: 55%;
        animation: blow 5000ms infinite;
        animation-delay: 9871ms;
      }
      
      @keyframes blow {
        0% {
          opacity: 0;
          transform: translate(0, 0);
        }
        20% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translate(0, -100vh) scale(0.2);
        }
      }`

  AbacusLib.createWebComponent('bubble-background', {
    html,
    css,

    onAfterFirstRender() {
      const appendAnimationBubbles = () => {
        const $root = this.shadowRoot
        const $container = document.createElement('div')

        $container.className = 'bottom-particles'

        const $bubble = document.createElement('div')
        $bubble.classList.add('bottom-particles', 'bubble')

        for (let i = 0; i < 21; i++) {
          $container.appendChild($bubble.cloneNode(true))
        }

        $root.appendChild($container)
      }

      appendAnimationBubbles()
    }
  })
})()