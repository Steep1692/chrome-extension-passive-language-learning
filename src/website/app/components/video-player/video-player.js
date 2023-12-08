(() => {
  const html = ({ src, trackSrc }) => {
    const srcLang = trackSrc.split('/').pop().split('.')[1]
    return (
      `<video class="root" muted controls src="${src}">
        <!-- key is added so the new node is mounted to DOM every time the subtitles track is changed,
         otherwise it would be the same node but with changing attributes -->
        <track data-key="${srcLang}" kind="subtitles" default src="${trackSrc}" srclang="${srcLang}" label="${srcLang}">
      </video>`
    )
  }

  class Component extends AbacusLib.Component {
    dontUseShadowDOM = true
    html = html
    css = `
      .root {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `
  }

  AbacusLib.defineCustomElement('video-player', Component)
})()