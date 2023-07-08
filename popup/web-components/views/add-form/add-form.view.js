(() => {
  // Function to handle input debouncing
  function debounce(func, delay) {
    let timer

    return function (...args) {
      clearTimeout(timer)
      timer = setTimeout(() => func(...args), delay)
    }
  }

  const TRANSLATION_DEBOUNCE = 500

  const decorateWithTranslation = ($fromInput, $toInput, {
    fromLang,
    toLang,
  }) => {
    let cancelFetchTranslationSignal
    const originalPlaceholder = $toInput.placeholder
    let isLastTransSetFromAPI = false

    const translator = new Translator(fromLang, toLang)

    $fromInput.addEventListener('input', debounce(async () => {
      const value = $fromInput.value.trim()
      const translateValue = $toInput.value.trim()

      if (value !== '' && (translateValue === '' || isLastTransSetFromAPI)) {
        $toInput.placeholder = 'Loading…'
        $toInput.value = ''

        const controller = new AbortController()
        cancelFetchTranslationSignal = controller.signal
        const translationString = await translator.getTranslation(value, {
          signal: cancelFetchTranslationSignal,
        })

        $toInput.value = translationString || ''
        $toInput.placeholder = originalPlaceholder
        isLastTransSetFromAPI = true
        cancelFetchTranslationSignal = null
      }
    }, TRANSLATION_DEBOUNCE))

    $toInput.addEventListener(('input'), () => {
      if (cancelFetchTranslationSignal) {
        cancelFetchTranslationSignal.abort()
      }

      isLastTransSetFromAPI = false
    })

    return translator
  }

  let translator

  const html = `
<form id="root">
              <label class="form-label" for="original-input">
                  <span>Original:</span>
                  <input class="form-input" type="text" id="original-input" placeholder="pig" required>
              </label>

              <label class="form-label" for="translation-input">
                  <span>Translation:</span>
                  <input class="form-input" type="text" id="translation-input" placeholder="豕" required>
              </label>

              <button type="submit" class="button-submit">
                  Add&nbsp;
                  <span class="emoji-wrap">
        <span class="emoji-valid">🐻</span>
        <span class="emoji-active">👍</span>
      </span>
              </button>
          </form>`

  AbacusLib.createWebComponent('add-form', html, {
    styleFilesURLs: [
      'web-components/views/add-form/add-form.css',
      'css/button.css'
    ],

    onAfterFirstRender: function (state) {
      const $form = this.shadowRoot.getElementById('root')
      const $originalInput = this.shadowRoot.getElementById('original-input')
      const $translationInput = this.shadowRoot.getElementById('translation-input')

      $form.addEventListener('submit', (event) => {
        event.preventDefault()

        this.store.addItem({
          original: $originalInput.value,
          translation: $translationInput.value
        })

        // Reset form inputs
        $originalInput.value = ''
        $translationInput.value = ''

        $originalInput.focus()
      })

      translator = decorateWithTranslation($originalInput, $translationInput, {
        fromLang: state.config.fromLang,
        toLang: state.config.toLang,
      })

      // Timeout, because focus is lost after render other components
      setTimeout(() => {
        $originalInput.focus()
      }, 100)
    },
    onStateChange: (state) => {
      translator.updateLanguages(state.config.fromLang, state.config.toLang)
    },
  })
})()