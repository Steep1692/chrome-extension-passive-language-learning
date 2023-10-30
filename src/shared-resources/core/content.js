(async () => {
  'use strict'

  class ScriptManager {
    static injectScriptToPage = (src) => {
      const n = document.createElement('script')
      n.id = YoutubeSubtitlesSpeech.scriptId
      document.documentElement.append(n)
      n.src = chrome.runtime.getURL(src)
      n.defer = true
      return new Promise((resolve) => {
        n.onload = resolve
      })
    }

    static importScript = async (src) => {
      const path = chrome.runtime.getURL(src)
      return (await import(path))
    }
  }

  let Translator, Toaster

  ScriptManager.importScript('shared-resources/plugins/translator.js').then((module) => {
    Translator = module.default
  })
  ScriptManager.importScript('shared-resources/plugins/toast.min.js').then((module) => {
    Toaster = module.toast
  })

  const FOLDERS_SAMPLE_DATA = [
    {
      id: '1',
      'name': 'Sample folder',
      'entriesId': '1',
    },
    {
      id: '2',
      'name': 'Numbers',
      'entriesId': '2',
    },
    {
      id: '3',
      'name': 'Family',
      'entriesId': '3',
    },
  ]

  const FOLDER_ENTRIES_SAMPLE_DATA = {
    1: [
      {
        'original': 'left',
        'translation': '左'
      },
      {
        'original': 'right',
        'translation': '右'
      },
      {
        'original': 'fire',
        'translation': '火'
      },
      {
        'original': 'good',
        'translation': '好'
      },
      {
        'original': 'big',
        'translation': '大'
      },
      {
        'original': 'horse',
        'translation': '马'
      },
      {
        'original': 'small',
        'translation': '小'
      },
      {
        'original': 'pig',
        'translation': '猪'
      },
      {
        'original': 'affection',
        'translation': '情'
      },
      {
        'original': 'drink',
        'translation': '饮'
      },
      {
        'original': 'water',
        'translation': '水'
      },
      {
        'original': 'full',
        'translation': '饱'
      },
      {
        'original': 'none',
        'translation': '无'
      },
      {
        'original': 'food',
        'translation': '食'
      },
      {
        'original': 'meal',
        'translation': '饭'
      },
      {
        'original': 'hungry',
        'translation': '饥'
      }
    ],
    2: [
      {
        'original': 'one',
        'translation': '–'
      }
    ],
    3: [
      {
        'original': 'person',
        'translation': '人'
      }
    ]
  }

  const INITIAL_STATE = {
    currentFolderId: null,
    folders: FOLDERS_SAMPLE_DATA,
    foldersEntries: FOLDER_ENTRIES_SAMPLE_DATA,
    config: {
      ignoredOrigins: [],
      youtubeAudioReplaceON: false,
      disabledAtAll: false,
      fromLang: 'en',
      toLang: 'zh',
      lang: 'uk',
      theme: 'uk',
      onboarded: false,
    },
    router: {
      path: 'dictionary',
    },
    clientInfo: {
      origin: window.location.origin,
    },
    constants: {
      paymentServiceLink: 'https://www.privat24.ua/rd/send_qr/liqpay_static_qr/qr_beb71f537aab43ecaceab4cd7670d36b',
    },
  }

  const CURSE_WORDS = [
    'хто', 'патрон', 'пес',
  ]

  class _NumberUtils {
    static isNumeric = (str) => /^\d+$/.test(str)
    static isNumberBetweenEquals = (number, min, max) => number >= min && number <= max
  }

  class _DOMUtils {
    static #INPUT_TAGS = ['textarea', 'input', 'select']

    static isInputNode(node) {
      return (
        _DOMUtils.#INPUT_TAGS.includes(node.tagName.toLowerCase())
        || node.contentEditable === 'true'
        || node.role === 'textbox'
        || node.role === 'listbox'
      )
    }

    static traverseParent = (node, callback) => {
      let parent = node.parentNode
      while (parent !== null) {
        if (callback(parent)) {
          return true
        }
        parent = parent.parentElement
      }
      return false
    }
  }

  class _StringUtils {
    static replaceRandomWord = (str, newWord) => {
      const words = str.split(' ')
      const randomIndex = Math.floor(Math.random() * words.length)
      words[randomIndex] = newWord
      return words.join(' ')
    }
  }

  class _ArrayUtils {
    static getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
  }

  class Store {
    constructor(key, defaultValue, { version }) {
      this.key = key
      this.version = version
      this.keyWithVersion = Store.getKeyWithVersion(key, version)
      this.defaultValue = defaultValue

      Store.cleanPreviousVersions(key, version)
    }

    static getKeyWithVersion(key, version) {
      return key + '_' + version
    }

    static cleanPreviousVersions(key, version) {
      const keyWithVersion = Store.getKeyWithVersion(key, version)

      return chrome.storage.local.get().then((result) => {
        for (const resultKey in result) {
          if (resultKey.includes(key) && resultKey !== keyWithVersion) {
            chrome.storage.local.remove(resultKey)
          }
        }
      })
    }

    load() {
      return chrome.storage.local.get([this.keyWithVersion]).then((result) => result[this.keyWithVersion] ?? this.defaultValue)
    }

    save(payload) {
      return chrome.storage.local.set({ [this.keyWithVersion]: payload })
    }

    subscribe(callback) {
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes[this.keyWithVersion]) {
          callback(changes[this.keyWithVersion].newValue)
        }
      })
    }
  }

  class _MediaManager {
    static getVideoElements = () => document.querySelectorAll('video')
    static getPlayingVideoElements = () => [..._MediaManager.getVideoElements()].filter((el) => !el.paused)
    static getAudioElements = () => document.querySelectorAll('audio')
    static getPlayingAudioElements = () => [..._MediaManager.getAudioElements()].filter((el) => !el.paused)
  }

  class MediaVolumeLower extends _MediaManager {
    #lowerValue
    #loweredCollection = new Map()

    constructor(lowerValue) {
      super()
      this.#lowerValue = lowerValue
    }

    #lowerIfNeeded($el) {
      if ($el.volume > this.#lowerValue) {
        this.#loweredCollection.set($el, $el.volume)
        $el.volume = this.#lowerValue
      }
    }

    lower() {
      for (const $el of MediaVolumeLower.getPlayingAudioElements()) {
        this.#lowerIfNeeded($el)
      }
      for (const $el of MediaVolumeLower.getPlayingVideoElements()) {
        this.#lowerIfNeeded($el)
      }
    }

    higher() {
      for (const [$element, initialVolume] of this.#loweredCollection) {
        $element.volume = initialVolume
      }
    }
  }

  class MediaPauser extends _MediaManager {
    #affectedCollection = []

    #pauseIfNeeded($el) {
      if (!$el.paused) {
        this.#affectedCollection.push($el)
        $el.pause()
      }
    }

    pause() {
      for (const $el of MediaPauser.getPlayingAudioElements()) {
        this.#pauseIfNeeded($el)
      }
      for (const $el of MediaPauser.getPlayingVideoElements()) {
        this.#pauseIfNeeded($el)
      }
    }

    play() {
      for (const $element of this.#affectedCollection) {
        $element.play()
      }
    }
  }

  class Tooltip {
    static tooltipId = 'pll-tooltip'
    static #contentClassName = 'pll-tooltip-content'
    static #arrowClassName = 'pll-tooltip-arrow'

    static #$tooltip
    static #$tooltipContent

    static show(content, x, y) {
      Tooltip.#$tooltip.style.left = x + 'px'
      Tooltip.#$tooltip.style.top = (y - 16) + 'px'

      Tooltip.#$tooltipContent.innerHTML = content
    }

    static hide() {
      Tooltip.#$tooltip.style.left = ''
    }

    static #injectStyles() {
      const $style = document.createElement('style')
      $style.innerHTML = `
      #${Tooltip.tooltipId} {
          z-index: 9999999;
          position: fixed;
          left: -200px;
        }
        
      .${Tooltip.#contentClassName} {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -100%);
        pointer-events: none;

        margin-bottom: 5px;
        padding: 7px;
        min-width: 80px;
        border-radius: 23px;
        border: 1px solid #ddd;

        background: linear-gradient(0deg, rgba(249, 255, 0, 1) 12%, rgba(0, 224, 255, 1) 82%);
        background-size: 100% 200%;
        color: #fff;
        box-shadow: 0 0 4px 1px yellow;
        text-shadow: -1px 0 rgba(0, 0, 0, 0.4), 0 1px rgba(0, 0, 0, 0.4), 1px 0 rgba(0, 0, 0, 0.4), 0 -1px rgba(0, 0, 0, 0.4);

        text-align: center;
        font-size: 18px;
        line-height: 1.2;

        animation: gradient 4s ease infinite forwards;
  }

.${Tooltip.#arrowClassName} {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 50%);
  pointer-events: none;

  width: 0;
  border-top: 5px solid black;
  border-right: 5px solid transparent;
  border-left: 5px solid transparent;
  font-size: 0;
  line-height: 0;
  animation: bounce 0.5s ease infinite forwards;
}
@keyframes bounce {
  0% {
    transform: translate(-50%, 50%) scale(0.5);
  }
  50% {
    transform: translate(-50%, 50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, 50%) scale(1);
  }
}


@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 0% -150%;
  }
  100% {
    background-position: 0% 50%;
  }
}

`
      document.head.appendChild($style)
    }

    static #injectHTML() {
      const $tooltip = document.createElement('div')

      $tooltip.id = Tooltip.tooltipId
      $tooltip.classList.add('pll-tooltip')
      $tooltip.innerHTML = `<div class="${Tooltip.#arrowClassName}"></div>
        <div class="${Tooltip.#contentClassName}"></div>`

      document.body.appendChild($tooltip)

      Tooltip.#$tooltip = $tooltip
      Tooltip.#$tooltipContent = $tooltip.querySelector('.' + Tooltip.#contentClassName)
    }

    static inject() {
      Tooltip.#injectHTML()
      Tooltip.#injectStyles()
    }
  }

  class Utterer {
    #utterThis
    #mediaPauser
    #audioVolumeLower

    constructor({ rate, lang, useVolumeLower, useMediaPauser }) {
      this.#utterThis = new SpeechSynthesisUtterance()

      this.#utterThis.lang = lang
      this.#utterThis.rate = rate

      if (useVolumeLower) {
        this.#audioVolumeLower = new MediaVolumeLower(0.6)
        this.#utterThis.addEventListener('start', () => this.#audioVolumeLower.lower())
        this.#utterThis.addEventListener('end', () => this.#audioVolumeLower.higher())
        this.#utterThis.addEventListener('pause', () => this.#audioVolumeLower.higher())
      }

      if (useMediaPauser) {
        this.#mediaPauser = new MediaPauser()
        this.#utterThis.addEventListener('start', () => this.#mediaPauser.pause())
        this.#utterThis.addEventListener('end', () => this.#mediaPauser.play())
        this.#utterThis.addEventListener('pause', () => this.#mediaPauser.play())
      }
    }

    setLang(lang) {
      this.#utterThis.lang = lang
    }

    speak(text, onEnd) {
      this.#utterThis.text = text
      speechSynthesis.cancel()
      speechSynthesis.speak(this.#utterThis)
      this.#utterThis.addEventListener('end', onEnd, { once: true })
    }

    pause() {
      speechSynthesis.pause()
    }
  }

  class _ReplacerUtils {
    static CODE_MARKUP_TAGS = ['pre', 'code']
    static IGNORED_TAGS = [..._ReplacerUtils.CODE_MARKUP_TAGS, 'script', 'style', 'svg', 'head']
    static NO_REPLACE_ATTR = 'pll-no-replace'
    static NO_HIGHLIGHT_ATTR = 'pll-no-highlight'
    static ALREADY_REPLACED_ATTR = 'pll-replaced'

    static isReplaced = (node) => node.hasAttribute(_ReplacerUtils.ALREADY_REPLACED_ATTR)

    static isSkipReplacing = (node) => (
      (node.nodeType === Node.TEXT_NODE || _ReplacerUtils.IGNORED_TAGS.includes(node.tagName.toLowerCase()))
      || _DOMUtils.isInputNode(node)
      || node.id === Tooltip.tooltipId
      || (Toaster && node.id === Toaster.toasterId)
      || _ReplacerUtils.isReplaced(node)
    )

    static isNoReplace = (node) => node.hasAttribute(_ReplacerUtils.NO_REPLACE_ATTR)
    static isNoHighlight = (node) => node.hasAttribute(_ReplacerUtils.NO_HIGHLIGHT_ATTR)

    static createMatchRegExp = (word) => (
      _NumberUtils.isNumeric(word)
        ? new RegExp(word, 'm')
        // ?! - negative lookahead
        // ?<! - negative lookbehind
        : new RegExp(`(?<!\\w)` + word + `[sи]?(?!\\w)`, 'im')
    )

    static matches = (node, word) => !!node.textContent.match(_ReplacerUtils.createMatchRegExp(word))

    static hasSkipReplacingParent(node) {
      return _DOMUtils.traverseParent(node, _ReplacerUtils.isSkipReplacing)
    }

    static hasNoReplaceParent(node) {
      return _DOMUtils.traverseParent(node, _ReplacerUtils.isNoReplace)
    }

    static hasNoHighlightParent(node) {
      return _DOMUtils.traverseParent(node, _ReplacerUtils.isNoHighlight)
    }
  }

  class DOMReplacer extends _ReplacerUtils {
    static #dictionary

    static Utterer = new Utterer({ useVolumeLower: true, useMediaPauser: true, lang: 'en-US', rate: 0.7 })

    static #MutationObserver = window.MutationObserver || window.WebKitMutationObserver
    static #observer = new DOMReplacer.#MutationObserver(function (mutations) {
      // To prevent an infinite loop after replaced the text, because it'd be a mutation.
      // Thanks to https://github.com/marcioggs/text-changer-chrome-extension/blob/master/scripts/changeText.js#L61
      DOMReplacer.#stopObserving()

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            DOMReplacer.replaceWords(DOMReplacer.#dictionary, node)
          }
        } else {
          DOMReplacer.replaceWords(DOMReplacer.#dictionary, mutation.target)
        }
      })

      DOMReplacer.#startObserving()
    })

    static #startObserving = () => {
      DOMReplacer.#observer.observe(document.body, { subtree: true, childList: true, characterData: true, })
    }

    static #stopObserving = () => {
      DOMReplacer.#observer.disconnect()
    }

    static setDictionaryAndReplace(dictionary) {
      DOMReplacer.#dictionary = dictionary
      DOMReplacer.replaceWords(DOMReplacer.#dictionary, document.body)
    }

    static enable(dictionary, langTo) {
      if (dictionary) {
        DOMReplacer.setDictionaryAndReplace(dictionary)
      }

      DOMReplacer.setTranslateLanguage(langTo)

      DOMReplacer.#startObserving(DOMReplacer.#observer)
    }

    static #replaceNew_needs_refactoring_has_exceptions(element, original, translation) {
      try {
        if (!element) {
          return
        }

        const regex = DOMReplacer.createMatchRegExp(original)

        var getNodes = function () {
          var nodes = [],
            offset = 0,
            node,
            nodeIterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT, null, false)

          while (node = nodeIterator.nextNode()) {
            nodes.push({
              textNode: node,
              start: offset,
              length: node.nodeValue.length
            })
            offset += node.nodeValue.length
          }
          return nodes
        }

        var nodes = getNodes()
        if (!nodes.length)
          return

        var text = ''
        for (var i = 0; i < nodes.length; ++i)
          text += nodes[i].textNode.nodeValue

        let match
        while (match = text.match(regex)) {
          // Prevent empty matches causing infinite loops
          if (!match[0].length) {
            continue
          }

          // Find the start and end text node
          var startNode = null, endNode = null
          for (i = 0; i < nodes.length; ++i) {
            var node = nodes[i]

            if (node.start + node.length <= match.index)
              continue

            if (!startNode)
              startNode = node

            if (node.start + node.length >= match.index + match[0].length) {
              endNode = node
              break
            }
          }

          var range = document.createRange()
          range.setStart(startNode.textNode, match.index - startNode.start)
          range.setEnd(endNode.textNode, match.index + match[0].length - endNode.start)

          const doNotReplace = DOMReplacer.hasNoReplaceParent(range.commonAncestorContainer)

          const spanNode = document.createElement('span')
          spanNode.style.backgroundColor = doNotReplace ? 'var(--bg-word-original, #aeffb1)' : 'var(--bg-word-translation, #ffbcff)'
          spanNode.style.color = 'black'
          spanNode.style.fontWeight = 'bold'
          spanNode.setAttribute(DOMReplacer.ALREADY_REPLACED_ATTR, 'true')

          if (doNotReplace) {
            const extract = range.extractContents()
            const $fragment = new DocumentFragment()
            $fragment.append(extract.textContent)
            spanNode.appendChild($fragment)
            range.insertNode(spanNode)
            return
          } else {
            spanNode.addEventListener('mouseover', (e) => {
              DOMReplacer.lastSpeakNode = e.currentTarget

              DOMReplacer.Utterer.speak(e.currentTarget.textContent, () => {
                DOMReplacer.lastSpeakNode = null
              })

              // Tooltip
              const rect = e.currentTarget.getBoundingClientRect()
              Tooltip.show(original, rect.right - rect.width / 2, rect.top)
            })

            spanNode.addEventListener('mouseout', (e) => {
              if (DOMReplacer.lastSpeakNode === e.currentTarget) {
                DOMReplacer.Utterer.pause()
              }

              Tooltip.hide()
            })

            range.extractContents()
            const $fragment = new DocumentFragment()
            $fragment.append(translation)
            spanNode.appendChild($fragment)
            range.insertNode(spanNode)
          }

          nodes = getNodes()
          text = ''

          for (let i = 0; i < nodes.length; ++i) {
            text += nodes[i].textNode.nodeValue
          }
        }
      } catch (e) {
        console.log(`%cUNEXPECTED ERROR: MINOR for future`, 'background: black; color: white;', {
          original,
          elementTextContent: element?.textContent
        })
        console.log(e)
      }
    }

    static #replace(node, original, translation) {
      return this.#replaceNew_needs_refactoring_has_exceptions(node.parentNode, original, translation)
    }

    static #findTextNodesByWord(word, rootNode) {
      if (rootNode.nodeType === Node.TEXT_NODE) {
        return DOMReplacer.matches(rootNode, word) ? [rootNode] : []
      }

      let queue = [rootNode], curr
      const nodes = []

      while (curr = queue.pop()) {
        if (curr.nodeType !== Node.ELEMENT_NODE && curr.nodeType !== Node.TEXT_NODE) {
          continue
        }

        if (curr.nodeType !== Node.TEXT_NODE && DOMReplacer.isSkipReplacing(curr)) {
          continue
        }

        for (const childNode of curr.childNodes) {

          if (childNode.nodeType === Node.TEXT_NODE) {
            if (DOMReplacer.matches(childNode, word)) {
              nodes.push(childNode)
            }
          } else if (childNode.nodeType === Node.ELEMENT_NODE) {
            // DON'T match for text on this level!
            // Because it brokes the next case:
            // <a>Inline elements one by one in ONE line</a><span>without spaces</span>

            queue.push(childNode)
          }

        }
      }

      return nodes
    }

    static replaceWords(dictionary, rootNode) {
      for (let { original, translation } of dictionary) {
        if (original === translation) {
          continue
        }

        const nodesWithWord = DOMReplacer.#findTextNodesByWord(original, rootNode)

        for (const node of nodesWithWord) {
          if (!DOMReplacer.hasSkipReplacingParent(node)) {
            DOMReplacer.#replace(node, original, translation)
            if (rootNode.parentNode && rootNode.parentNode !== document) {
              rootNode = rootNode.parentNode
            }
          }
        }
      }
    }

    static setTranslateLanguage(language) {
      DOMReplacer.Utterer.setLang(language)
    }
  }

  class YoutubeApiExposer {
    static scriptInjected = false
    static #newVideoCaptionUrlListeners = []

    static inject = () => {
      ScriptManager.injectScriptToPage('shared-resources/core/injectable-content-script-that-can-access-anything.js')
      YoutubeApiExposer.scriptInjected = true
    }

    static #handleMessage = (e) => {
      if (e.data.type === 'pll-update-subtitles') {
        if (e.data.data) {
          for (const newVideoCaptionUrlListener of YoutubeApiExposer.#newVideoCaptionUrlListeners) {
            newVideoCaptionUrlListener(e.data.data)
          }
        }
      }
    }

    static listenForInjectedScript = () => {
      window.addEventListener('message', YoutubeApiExposer.#handleMessage)
    }

    static removeListenerOfInjectedScript = () => {
      window.removeEventListener('message', YoutubeApiExposer.#handleMessage)
    }

    static addNewVideoCaptionUrlListener = (listener) => {
      YoutubeApiExposer.#newVideoCaptionUrlListeners.push(listener)
    }

    static removeNewVideoCaptionUrlListener = (listener) => {
      YoutubeApiExposer.#newVideoCaptionUrlListeners = YoutubeApiExposer.#newVideoCaptionUrlListeners.filter(l => l !== listener)
    }
  }

  class YoutubeSubtitlesSpeech {
    static utterThis2 = new Utterer({ useVolumeLower: true, rate: 1.2 })
    static #enabled = false
    static #engineEnabled = false
    static #segments
    static #dictionaryMap
    static #$player
    static #langFrom
    static #langTo
    static #captionUrl

    static scriptId = 'pll-youtube-api-exposer-script'


    static #normalizeYoutubeCaptions = (captionEvents) => {
      const out = []

      let event, nextEvent
      for (let i = 0; i < captionEvents.length; i++) {
        event = captionEvents[i]

        if (!event.segs?.length) {
          continue
        }

        nextEvent = captionEvents[i + 1]

        const start = event.tStartMs
        const end = nextEvent?.tStartMs !== undefined ? nextEvent.tStartMs : (event.tStartMs + event.dDurationMs)

        let segment, nextSegment
        for (let j = 0; j < event.segs.length; j++) {
          segment = event.segs[j]

          if (!segment.utf8) {
            continue
          }

          nextSegment = event.segs[j + 1]

          out.push({
            text: segment.utf8,
            start: start + (segment.tOffsetMs ?? 0),
            end: nextSegment?.tOffsetMs !== undefined ? (start + nextSegment?.tOffsetMs) : end,
          })
        }
      }

      return out
    }

    static #downloadCaptions = async () => {
      const captionUrl = YoutubeSubtitlesSpeech.#captionUrl
      if (!captionUrl) {
        return
      }

      let urlWithRightLang = captionUrl.replace(/&lang=[^&]+/, `&lang=` + YoutubeSubtitlesSpeech.#langFrom)
      urlWithRightLang += '&fmt=json3'
      urlWithRightLang += '&tlang=' + YoutubeSubtitlesSpeech.#langTo

      YoutubeSubtitlesSpeech.#segments = await fetch(urlWithRightLang)
        .then(r => r.json())
        .then((result) => YoutubeSubtitlesSpeech.#normalizeYoutubeCaptions(result.events))

      YoutubeSubtitlesSpeech.#$player = _MediaManager.getVideoElements()?.[0]
    }


    static #startReplaceEngine = () => {
      YoutubeSubtitlesSpeech.#engineEnabled = true

      let lastSegment

      const frame = () => {
        const playing = YoutubeSubtitlesSpeech.#$player && !YoutubeSubtitlesSpeech.#$player.paused

        if (playing && YoutubeSubtitlesSpeech.#segments?.length) {
          const currentTimeMs = YoutubeSubtitlesSpeech.#$player.currentTime * 1000 + 280

          const segment = YoutubeSubtitlesSpeech.#segments.find(
            (s) => _NumberUtils.isNumberBetweenEquals(currentTimeMs, s.start, s.end)
          )
          const text = segment?.text

          if (lastSegment !== segment) {
            lastSegment = segment

            const textNormalized = segment?.text.trim().toLowerCase().replace(/[sиы]$/, '')
            const translation = YoutubeSubtitlesSpeech.#dictionaryMap[textNormalized]

            if (translation) {
              console.log('speaking: ', text, ' as :', translation)
              YoutubeSubtitlesSpeech.utterThis2.speak(translation)
            }
          }
        }

        if (YoutubeSubtitlesSpeech.#engineEnabled) {
          requestAnimationFrame(frame)
        }
      }

      if (YoutubeSubtitlesSpeech.#engineEnabled) {
        requestAnimationFrame(frame)
      }
    }

    static #startCurseWordsReplaceEngine = () => {
      YoutubeSubtitlesSpeech.#engineEnabled = true

      let lastTime
      const CHUNK_SIZE_MS = 2000
      const frame = () => {
        const playing = YoutubeSubtitlesSpeech.#$player && !YoutubeSubtitlesSpeech.#$player.paused

        if (playing && YoutubeSubtitlesSpeech.#segments?.length) {
          const currentTimeMs = YoutubeSubtitlesSpeech.#$player.currentTime * 1000 + 280

          const now = performance.now()
          if (!lastTime || now - lastTime > CHUNK_SIZE_MS) {
            lastTime = now

            const segments = YoutubeSubtitlesSpeech.#segments.filter(
              (s) => (
                _NumberUtils.isNumberBetweenEquals(s.start, currentTimeMs, currentTimeMs + CHUNK_SIZE_MS)
                && _NumberUtils.isNumberBetweenEquals(s.end, currentTimeMs, currentTimeMs + CHUNK_SIZE_MS)
              )
            )
            const text = segments.map((s) => s.text).join(' ')

            const textCursified = _StringUtils.replaceRandomWord(
              text, _ArrayUtils.getRandomItem(CURSE_WORDS)
            )
            YoutubeSubtitlesSpeech.utterThis2.speak(textCursified)
          }
        }

        if (YoutubeSubtitlesSpeech.#engineEnabled) {
          requestAnimationFrame(frame)
        }
      }

      if (YoutubeSubtitlesSpeech.#engineEnabled) {
        requestAnimationFrame(frame)
      }
    }

    static #stopReplaceEngine = () => {
      YoutubeSubtitlesSpeech.#engineEnabled = false
    }

    static #onNewVideoCaptionUrl = (captionUrl) => {
      YoutubeSubtitlesSpeech.#captionUrl = captionUrl
      YoutubeSubtitlesSpeech.#downloadCaptions()
    }

    static enable(dictionary, langFrom, langTo) {
      if (dictionary) {
        YoutubeSubtitlesSpeech.setDictionary(dictionary)
      }

      if (langFrom && langTo) {
        YoutubeSubtitlesSpeech.setLangs(langFrom, langTo)
      }

      if (!YoutubeSubtitlesSpeech.#enabled) {
        YoutubeSubtitlesSpeech.#enabled = true

        if (!YoutubeApiExposer.scriptInjected) {
          YoutubeApiExposer.inject()
          YoutubeApiExposer.listenForInjectedScript()
          // FIXME: Possible context loose
          YoutubeApiExposer.addNewVideoCaptionUrlListener(YoutubeSubtitlesSpeech.#onNewVideoCaptionUrl)
        }

        YoutubeSubtitlesSpeech.#startReplaceEngine()
      }
    }

    static disable() {
      if (YoutubeSubtitlesSpeech.#enabled) {
        YoutubeSubtitlesSpeech.#enabled = false

        if (YoutubeApiExposer.scriptInjected) {
          YoutubeApiExposer.removeListenerOfInjectedScript()
          YoutubeApiExposer.removeNewVideoCaptionUrlListener(YoutubeSubtitlesSpeech.#onNewVideoCaptionUrl)
        }

        YoutubeSubtitlesSpeech.#stopReplaceEngine()
      }
    }

    static setDictionary(dictionary) {
      YoutubeSubtitlesSpeech.#dictionaryMap = dictionary.reduce((acc, { original, translation }) => {
        acc[original] = translation
        return acc
      }, {})
    }

    static setLangs(langFrom, langTo) {
      YoutubeSubtitlesSpeech.#langFrom = langFrom
      YoutubeSubtitlesSpeech.#langTo = langTo
      YoutubeSubtitlesSpeech.utterThis2.setLang(langTo)
    }

    static setLangsWithUpdate(langFrom, langTo) {
      if (YoutubeSubtitlesSpeech.#langFrom !== langFrom || YoutubeSubtitlesSpeech.#langTo !== langTo) {
        YoutubeSubtitlesSpeech.setLangs(langFrom, langTo)

        YoutubeSubtitlesSpeech.#downloadCaptions()
      }
    }
  }

  class VideoSubtitlesReplacer extends _ReplacerUtils {
    static #enabled = false
    static #dictionary
    static #videoToTTChangeListener = new WeakMap()
    static #lastVideoReplacedTTs = new WeakMap()

    static #MutationObserver = window.MutationObserver || window.WebKitMutationObserver
    static #observer = new VideoSubtitlesReplacer.#MutationObserver(function (mutations) {
      // To prevent an infinite loop after replaced the text, because it'd be a mutation.
      // Thanks to https://github.com/marcioggs/text-changer-chrome-extension/blob/master/scripts/changeText.js#L61
      VideoSubtitlesReplacer.#stopObserving()

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.tagName === 'VIDEO') {
              VideoSubtitlesReplacer.#handleNewVideoNode(node)
            }
          }
        }
      })

      VideoSubtitlesReplacer.#startObserving()
    })

    static #startObserving = () => {
      VideoSubtitlesReplacer.#observer.observe(document.body, { subtree: true, childList: true, characterData: true, })
    }

    static #stopObserving = () => {
      VideoSubtitlesReplacer.#observer.disconnect()
    }

    static async #replaceInTTs(tts, $video) {
      VideoSubtitlesReplacer.#lastVideoReplacedTTs.set($video, tts)

      const ttArr = [...tts]

      for (const tt of ttArr) {
        const step = () => {
          if (tt.cues?.length) {
            [...tt.cues].forEach((cue, index, cues) => {
              const skip = VideoSubtitlesReplacer.hasSkipReplacingParent($video)
              if (skip) {
                return
              }

              for (const { original, translation } of VideoSubtitlesReplacer.#dictionary) {
                const regex = VideoSubtitlesReplacer.createMatchRegExp(original)
                const noReplace = VideoSubtitlesReplacer.hasNoReplaceParent($video)

                const className = noReplace ? 'pll-original' : 'pll-translation'
                const word = noReplace ? original : translation
                const prefix = `.${VideoSubtitlesReplacer.ALREADY_REPLACED_ATTR}><b>`

                if (!regex.test(cue.text)) {
                  continue
                }

                const textNew = cue.text.replace(regex, (matchStr, index, str) => {
                  const alreadyReplaced = str.slice(0, index).endsWith(prefix)
                  if (alreadyReplaced) {
                    return matchStr
                  }

                  return `<c.${className}${prefix}${word}</b></c>`
                })

                if (textNew === cue.text) {
                  continue
                }

                const newCue = new VTTCue(cue.startTime, cue.endTime, textNew);
                tt.addCue(newCue)

                const cueToRemove = cues.find((c) => c === cue)
                if (cueToRemove) {
                  tt.removeCue(cue)
                }
              }
            })
          }

          return !!tt.cues?.length
        }

        const resultOK = step()

        if (!resultOK) {
          let intervalMax = 10

          const intervalId = setInterval(() => {
            const stillActualTTs = VideoSubtitlesReplacer.#lastVideoReplacedTTs.get($video) === tts
            if (!stillActualTTs) {
              clearInterval(intervalId)
              return
            }

            intervalMax--

            const resultOK = step()

            if (intervalMax === 0 || resultOK) {
              clearInterval(intervalId)
            }
          }, 50)
        }
      }
    }

    static #replaceInTTsByVideo(video) {
      VideoSubtitlesReplacer.#replaceInTTs(video.textTracks, video)
    }


    static #createTTChangeListener($video) {
      return (event) => {
        const textTracks = event.currentTarget
        VideoSubtitlesReplacer.#replaceInTTs(textTracks, $video)
      }
    }

    static #removeListenTTChanges($video) {
      const listener = VideoSubtitlesReplacer.#videoToTTChangeListener.get($video)
      $video.textTracks.removeEventListener('change', listener)
    }

    static #listenTTChanges($video) {
      const listener = VideoSubtitlesReplacer.#createTTChangeListener($video)
      VideoSubtitlesReplacer.#videoToTTChangeListener.set($video, listener)
      $video.textTracks.addEventListener('change', listener)
    }


    static #handleNewVideoNode(video) {
      VideoSubtitlesReplacer.#listenTTChanges(video)
      // VideoSubtitlesReplacer.#replaceInTTsByVideo(video)
    }

    static #replace() {
      const $videos = document.querySelectorAll('video')
      $videos.forEach(VideoSubtitlesReplacer.#replaceInTTsByVideo)
    }

    static #setDictionary(dictionary) {
      VideoSubtitlesReplacer.#dictionary = dictionary
    }

    static setDictionaryAndReplace(dictionary) {
      VideoSubtitlesReplacer.#setDictionary(dictionary)
      VideoSubtitlesReplacer.#replace()
    }

    static enable(dictionary) {
      if (VideoSubtitlesReplacer.#enabled) {
        return;
      }

      VideoSubtitlesReplacer.#enabled = true

      VideoSubtitlesReplacer.#setDictionary(dictionary)

      const $videos = document.querySelectorAll('video')
      $videos.forEach(VideoSubtitlesReplacer.#handleNewVideoNode)

      VideoSubtitlesReplacer.#startObserving()
    }

    static disable() {
      if (!VideoSubtitlesReplacer.#enabled) {
        return;
      }

      VideoSubtitlesReplacer.#enabled = false

      // TODO: implement logic of putting replaced words back
      VideoSubtitlesReplacer.#removeListenTTChanges()
      VideoSubtitlesReplacer.#stopObserving()
    }
  }

  const isIgnoredOrigin = (state) => state.config.ignoredOrigins.includes(state.clientInfo.origin)
  const isDisabled = (state) => state.config.disabledAtAll || isIgnoredOrigin(state)
  const getAllFoldersEntries = (foldersEntries) => {
    return Object.values(foldersEntries).flat()
  }

  const stateManager = new Store('state', INITIAL_STATE, {
    version: '1',
  })

  let lastState = await stateManager.load()

  Tooltip.inject()

  if (!isDisabled(lastState)) {
    const dictionary = getAllFoldersEntries(lastState.foldersEntries)

    DOMReplacer.enable(dictionary, lastState.config.toLang)
    YoutubeSubtitlesSpeech.enable(dictionary, lastState.config.fromLang, lastState.config.toLang)
    VideoSubtitlesReplacer.enable(dictionary)
  }

  stateManager.subscribe((value) => {
    lastState = value

    const dictionary = getAllFoldersEntries(lastState.foldersEntries)

    DOMReplacer.setDictionaryAndReplace(dictionary)
    YoutubeSubtitlesSpeech.setDictionary(dictionary)
    VideoSubtitlesReplacer.setDictionaryAndReplace(dictionary)
  })

  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.type) {
      case 'get-data': {
        sendResponse({ state: lastState })
        break
      }
      case 'set-data': {
        stateManager.save(message.data)
        sendResponse(true)
        break
      }
      case 'add-word': {
        const { word } = message.data

        let wordTranslated
        if (Translator) {
          Toaster?.toast('Loading translation…')
          const translator = new Translator(lastState.config.fromLang, lastState.config.toLang)
          wordTranslated = await translator.getTranslation(word)
        }

        let newDictItem
        let translation

        while (true) {
          translation = prompt(`Please, enter a translation for the word "${word}"`, wordTranslated)

          newDictItem = { original: word, translation, }

          if (translation.toLowerCase() === word.toLowerCase()) {
            const reEnter = confirm('Translation is the same as the word. Please, enter a different translation. Re-enter?')

            if (!reEnter) {
              newDictItem = null
              translation = null
              break
            }
          } else {
            break
          }
        }

        if (translation) {
          dictionaryStoreManager.save([...lastState.dictionary, newDictItem])

          Toaster?.toast(`Word added ${word}: ${translation}!`)

          sendResponse(true)
        } else {
          sendResponse(false)
        }

        break
      }
    }
  })
})()