const Router = (() => {
  const SCREEN = {
    setup: 'setup',
    main: 'main',
  }

  const makeActiveScreen = (screen) => {
    const $screens = Object.values(SCREEN).map((key) => document.getElementById('screen-' + key))

    for (const $screen of $screens) {
      if ($screen.id === 'screen-' + screen) {
        $screen.style.display = ''
      } else {
        $screen.style.display = 'none'
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    makeActiveScreen(SCREEN.setup)
  }, { once: true })

  return {
    SCREEN,
    makeActiveScreen,
  }
})()