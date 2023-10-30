const ThemeController = (() => {
  const themeUK = {
    '--splash-primary': '#57dffa',
    '--primary': '#03a9f4',
    '--splash-secondary': '#fbffa1',
    '--secondary': '#ffeb3b',
    '--text-light': '#fff',
    '--text-body': '#00bcd4',
    '--link-color': '#03a9f4',
    '--bg-word-original': '#aeffb1',
    '--bg-word-translation': '#ffbcff',
  }

  const themeEN = {
    '--splash-primary': '#9bffeb',
    '--primary': '#59b4ff',
    '--splash-secondary': '#6dddff',
    '--secondary': '#7cff68',
    '--text-light': '#fff',
    '--text-body': '#00bcd4',
    '--link-color': '#03a9f4',
    '--bg-word-original': '#aeffb1',
    '--bg-word-translation': '#ffbcff',
  }

  const themeZH = {
    '--splash-primary': '#ffea00',
    '--primary': '#f40303',
    '--splash-secondary': '#ff6e6e',
    '--secondary': '#ffea00',
    '--text-light': '#fff',
    '--text-body': '#00bcd4',
    '--link-color': '#03a9f4',
    '--bg-word-original': '#aeffb1',
    '--bg-word-translation': '#ffbcff',
  }

  const themes = {
    uk: themeUK,
    en: themeEN,
    zh: themeZH,
  }

  const applyTheme = (themeId) => {
    const theme = themes[themeId]
    Object.keys(theme).forEach(key => {
      document.documentElement.style.setProperty(key, theme[key])
    })
  }

  return {
    applyTheme,
  }
})()
