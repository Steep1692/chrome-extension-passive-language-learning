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

  const getInputValueTrimmed = ($input) => {
    return $input.value.trim()
  }

  const validateEmpty = ($input) => {
    return getInputValueTrimmed($input) === ''
  }

  const validateSameValue = ($input1, $input2) => {
    return getInputValueTrimmed($input1).toLowerCase() === getInputValueTrimmed($input2).toLowerCase()
  }

  const invalidAllowedClassName = 'show-invalid'

  const makeInputInvalid = ($input, reason) => {
    $input.setCustomValidity(reason)
    $input.classList.add(invalidAllowedClassName)
    $input.reportValidity()
  }

  const resetInvalidInputOnFirstChangeOnce = ($input) => {
    $input.addEventListener('change', () => {
      $input.setCustomValidity('')
      $input.classList.remove(invalidAllowedClassName)
      $input.reportValidity()
    }, { once: true })
  }


  const html = ({ t }) => {
    return (
      `<form id="root" data-listen-on-Submit="onSubmit">
        <label class="form-label" for="original-input">
            <span>${t.original}:</span>
            <input class="form-input" type="text" id="original-input" placeholder="pig" data-listen-on-Input="onInputFrom">
        </label>

        <label class="form-label" for="translation-input">
            <span>${t.translation}:</span>
            <input class="form-input" type="text" id="translation-input" placeholder="豕" data-listen-on-Input="onInputTo">
        </label>

        <button type="submit" is="pll-button" data-variant="submit">
            ${t.add}&nbsp;
            <span class="emoji-wrap">
            <span class="emoji-valid">🐻</span>
            <span class="emoji-active">👍</span>
          </span>
        </button>
      </form>`
    )
  }

  const translatesEN = {
    original: 'Original',
    translation: 'Translation',
    add: 'Add',
  }

  const translatesUK = {
    original: 'Оригінал',
    translation: 'Переклад',
    add: 'Додати',
  }

  const translatesZH = {
    original: '原文',
    translation: '翻译',
    add: '添加',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  let translator
  let originalPlaceholder = ''
  let cancelFetchTranslationSignal
  let isLastTransSetFromAPI = false

  class Component extends AbacusLib.Component {
    translates = translates

    html = html
    styleFilesURLs = [
      'default',
    ]

    methods = {
      onInputFrom: debounce(async function (ctx, event) {
        if (!translator) {
          return;
        }

        const $fromInput = ctx.$root.querySelector('#original-input')
        const $toInput = ctx.$root.querySelector('#translation-input')

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
      }, TRANSLATION_DEBOUNCE),
      onInputTo() {
        if (cancelFetchTranslationSignal) {
          cancelFetchTranslationSignal.abort()
        }

        isLastTransSetFromAPI = false
      },
      onSubmit(ctx, event) {
        event.preventDefault()

        const $originalInput = ctx.$root.querySelector('#original-input')
        const $translationInput = ctx.$root.querySelector('#translation-input')

        if (validateEmpty($originalInput)) {
          makeInputInvalid($originalInput, 'Please enter original')
          resetInvalidInputOnFirstChangeOnce($originalInput)
          return false
        }

        if (validateEmpty($translationInput)) {
          makeInputInvalid($translationInput, 'Please enter original')
          resetInvalidInputOnFirstChangeOnce($translationInput)
          return false
        }

        if (validateSameValue($originalInput, $translationInput)) {
          makeInputInvalid($translationInput, 'Original and translation should be different')
          resetInvalidInputOnFirstChangeOnce($translationInput)
          resetInvalidInputOnFirstChangeOnce($originalInput)
          return false
        }

        this.stateMutators.addItem({
          original: $originalInput.value,
          translation: $translationInput.value
        })

        // Reset form inputs
        $originalInput.value = ''
        $translationInput.value = ''

        $originalInput.focus()

        return false
      }
    }

    plugins = ['Translator']

    onAfterFirstRender = async function (ctx) {
      const $translationInput = ctx.$root.getElementById('translation-input')
      originalPlaceholder = $translationInput.placeholder

      if (this.getAttribute('dontFocusOnMount') !== 'true') {
        const $originalInput = ctx.$root.getElementById('original-input')

        // Timeout, because focus is lost after render other components
        setTimeout(() => {
          $originalInput.focus()
        }, 100)
      }

      await this.plugins.Translator
      translator = new this.plugins.Translator(ctx.state.config.fromLang, ctx.state.config.toLang)
    }
    stateEffects = [
      function () {
        const fromLang = this.state.config.lang
        const toLang = this.state.config.toLang

        if (translator) {
          translator.updateLanguages(fromLang, toLang)
        }
      },
    ]
  }

  AbacusLib.defineCustomElement('add-form', Component)
})()