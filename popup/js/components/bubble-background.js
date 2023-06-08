// Code is based on the following codepen by @Paolo-Duzioni: https://codepen.io/Paolo-Duzioni/pen/MQmbJo

class BubbleWebComponent extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
    const appendAnimationBubbles = () => {
      console.log(this.shadowRoot)
      const $root = this.shadowRoot.querySelector('.root')
      const $container = document.createElement('div')

      $container.className = 'bottom-particles'

      const $bubble = document.createElement('div')
      $bubble.classList.add('bottom-particles', 'bubble')

      for (let i = 0; i < 50; i++) {
        $container.appendChild($bubble.cloneNode(true))
      }

      $root.appendChild($container)
    }
    appendAnimationBubbles()
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
      .root {
      position: relative;
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
  background-color: rgba(255, 255, 255, 0.5);
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
.bottom-particles .bubble:nth-child(22) {
  left: 86%;
  animation: blow 5000ms infinite;
  animation-delay: 1425ms;
}
.bottom-particles .bubble:nth-child(23) {
  left: 98%;
  animation: blow 8661ms infinite;
  animation-delay: 11345ms;
}
.bottom-particles .bubble:nth-child(24) {
  left: 8%;
  animation: blow 9462ms infinite;
  animation-delay: 8794ms;
}
.bottom-particles .bubble:nth-child(25) {
  left: 36%;
  animation: blow 14199ms infinite;
  animation-delay: 6630ms;
}
.bottom-particles .bubble:nth-child(26) {
  left: 38%;
  animation: blow 8553ms infinite;
  animation-delay: 11547ms;
}
.bottom-particles .bubble:nth-child(27) {
  left: 11%;
  animation: blow 10995ms infinite;
  animation-delay: 2839ms;
}
.bottom-particles .bubble:nth-child(28) {
  left: 32%;
  animation: blow 5000ms infinite;
  animation-delay: 37ms;
}
.bottom-particles .bubble:nth-child(29) {
  left: 28%;
  animation: blow 9168ms infinite;
  animation-delay: 4237ms;
}
.bottom-particles .bubble:nth-child(30) {
  left: 36%;
  animation: blow 11668ms infinite;
  animation-delay: 794ms;
}
.bottom-particles .bubble:nth-child(31) {
  left: 27%;
  animation: blow 6446ms infinite;
  animation-delay: 9068ms;
}
.bottom-particles .bubble:nth-child(32) {
  left: 7%;
  animation: blow 12930ms infinite;
  animation-delay: 8736ms;
}
.bottom-particles .bubble:nth-child(33) {
  left: 99%;
  animation: blow 11951ms infinite;
  animation-delay: 6057ms;
}
.bottom-particles .bubble:nth-child(34) {
  left: 92%;
  animation: blow 9768ms infinite;
  animation-delay: 7321ms;
}
.bottom-particles .bubble:nth-child(35) {
  left: 60%;
  animation: blow 12993ms infinite;
  animation-delay: 2931ms;
}
.bottom-particles .bubble:nth-child(36) {
  left: 64%;
  animation: blow 6788ms infinite;
  animation-delay: 5958ms;
}
.bottom-particles .bubble:nth-child(37) {
  left: 14%;
  animation: blow 5000ms infinite;
  animation-delay: 9958ms;
}
.bottom-particles .bubble:nth-child(38) {
  left: 44%;
  animation: blow 14100ms infinite;
  animation-delay: 5914ms;
}
.bottom-particles .bubble:nth-child(39) {
  left: 2%;
  animation: blow 5000ms infinite;
  animation-delay: 5097ms;
}
.bottom-particles .bubble:nth-child(40) {
  left: 66%;
  animation: blow 7088ms infinite;
  animation-delay: 8210ms;
}
.bottom-particles .bubble:nth-child(41) {
  left: 95%;
  animation: blow 5000ms infinite;
  animation-delay: 5703ms;
}
.bottom-particles .bubble:nth-child(42) {
  left: 56%;
  animation: blow 8932ms infinite;
  animation-delay: 4205ms;
}
.bottom-particles .bubble:nth-child(43) {
  left: 15%;
  animation: blow 5000ms infinite;
  animation-delay: 11343ms;
}
.bottom-particles .bubble:nth-child(44) {
  left: 44%;
  animation: blow 12483ms infinite;
  animation-delay: 3001ms;
}
.bottom-particles .bubble:nth-child(45) {
  left: 87%;
  animation: blow 6219ms infinite;
  animation-delay: 2971ms;
}
.bottom-particles .bubble:nth-child(46) {
  left: 71%;
  animation: blow 9256ms infinite;
  animation-delay: 6229ms;
}
.bottom-particles .bubble:nth-child(47) {
  left: 46%;
  animation: blow 12082ms infinite;
  animation-delay: 7982ms;
}
.bottom-particles .bubble:nth-child(48) {
  left: 83%;
  animation: blow 12699ms infinite;
  animation-delay: 1205ms;
}
.bottom-particles .bubble:nth-child(49) {
  left: 74%;
  animation: blow 5000ms infinite;
  animation-delay: 7115ms;
}
.bottom-particles .bubble:nth-child(50) {
  left: 67%;
  animation: blow 11877ms infinite;
  animation-delay: 1065ms;
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
}
      </style>

      <header class="root">
        <slot></slot>
      </header>
    `
  }
}

customElements.define('pll-bubble-background', BubbleWebComponent)