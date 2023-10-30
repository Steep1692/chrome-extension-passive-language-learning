(() => {
  const html = ({classnames, state}) => {
    const path = state.router.path
    const isOnBoarding = state.config.onboarded

    if (!isOnBoarding) {
      return ''
    }

    return (
      `
        <button class="${classnames({ 'active': path === 'home' })}" @onClick="goHome">
          <img src="/popup/app/components/header/home.svg" alt="Open home tab" />
        </button>
       <button class="${classnames({ 'active': path === 'dictionary' })}" @onClick="goDictionary">
          <img src="/popup/app/components/header/dictionary.svg" alt="Open dictionary tab" />
        </button>
        <button class="${classnames({ 'active': path === 'settings' })}" @onClick="goSettings">
          <img src="/popup/app/components/header/settings.svg" alt="Open settings tab" />
        </button>
        <button class="${classnames({ 'active': path === 'donate' })}" @onClick="goDonate">
          <img src="/popup/app/components/header/donate.svg" alt="Open donate tab" />
        </button>
         <button class="${classnames({ 'active': path === 'support' })}" @onClick="goSupport">
          <img src="/popup/app/components/header/support.svg" alt="Open support tab" />
        </button>
      `
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

  AbacusLib.createWebComponent('header', {
    translates,

    html,
    styleFilesURLs: [
      'default',
    ],

    methods: {
      goSettings() {
        this.stateMutators.setRoute('settings')
      },
      goDonate() {
        this.stateMutators.setRoute('donate')
      },
      goHome() {
        this.stateMutators.setRoute('home')
      },
      goDictionary() {
        this.stateMutators.setRoute('dictionary')
      },
      goSupport() {
        this.stateMutators.setRoute('support')
      },
    }
  })
})();