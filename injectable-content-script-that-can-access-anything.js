(() => {
  const onPageDataUpdated = () => {
    const player = document.getElementById("movie_player")
    const captionTracks = player?.getAudioTrack?.()?.captionTracks;
    const captionUrl = captionTracks?.find((t) => t.languageName.includes('auto-generated'))?.url ?? captionTracks?.[0]?.url ?? ''

    postMessage({ type: 'pll-update-subtitles', data: captionUrl })
  }


  window.addEventListener('yt-page-data-updated', onPageDataUpdated)

  onPageDataUpdated();
})()