(() => {
  const html = ({ classnames, state }) => {
    const path = state.router.path
    const notOnboarded = !state.config.onboarded

    // <button class="${classnames({ 'active': path === 'home' })}" data-listen-on-Click="goHome">
    //           <img src="/popup/app/components/header/home.svg" alt="Open home tab" />
    //         </button>
    //<button class="${classnames({ 'active': path === 'donate' })}" data-listen-on-Click="goDonate">
    //           <img src="/popup/app/components/header/donate.svg" alt="Open donate tab" />
    //         </button>
    //         <button class="${classnames({ 'active': path === 'support' })}" data-listen-on-Click="goSupport">
    //           <img src="/popup/app/components/header/support.svg" alt="Open support tab" />
    //         </button>

    if (notOnboarded) {
      return (
        `<pll-splash-text style="grid-column: 1/-1"></pll-splash-text>`
      )
    }

    return (
      `<button class="${classnames({ 'active': path === 'dictionary' })}" data-listen-on-Click="goDictionary">
          <img src="/popup/app/components/header/dictionary.svg" alt="Open dictionary tab" />
        </button>
        <button class="${classnames({ 'active': path === 'settings' })}" data-listen-on-Click="goSettings">
          <img src="/popup/app/components/header/settings.svg" alt="Open settings tab" />
        </button>`
    )
  }

  const translatesEN = {
    dictionary: 'Dictionary'
  }

  const translates = {
    en: translatesEN,
    uk: translatesEN,
    zh: translatesEN,
  }

  class HeaderComponent extends AbacusLib.Component {
    translates = translates
    styleFilesURLs = [
      'default',
    ]
    html = html

    methods = {
      goSettings: () => {
        this.stateMutators.setRoute('settings')
      },
      goDonate: () => {
        this.stateMutators.setRoute('donate')
      },
      goHome: () => {
        this.stateMutators.setRoute('home')
      },
      goDictionary: () => {
        this.stateMutators.setRoute('dictionary')
      },
      goSupport: () => {
        this.stateMutators.setRoute('support')
      },
    }
  }

  AbacusLib.defineCustomElement('header', HeaderComponent)
})()