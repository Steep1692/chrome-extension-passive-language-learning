export const appendCSS = ($root, css) => {
  const $style = document.createElement('style')
  $style.innerHTML = css
  $root.appendChild($style)
}

export const injectStyleFiles = (ctx, styleFilesURLs) => {
  const shadowDOM = ctx.shadowRoot
  const $content = shadowDOM ? ctx : ctx.$root
  const $stylesDestination = shadowDOM ? ctx.$root : ctx

  // Don't show possibly broken HTML–markup until all styles are loaded
  $content.style.visibility = 'hidden'

  let linksLoaded = 0

  const handleLinkLoad = () => {
    linksLoaded += 1

    if (linksLoaded === styleFilesURLs.length) {
      $content.style.visibility = ''
    }
  }

  for (const url of styleFilesURLs) {
    const $link = document.createElement('link')
    $link.href = url
    $link.rel = 'stylesheet'

    $link.addEventListener('load', handleLinkLoad)

    $stylesDestination.appendChild($link)
  }
}