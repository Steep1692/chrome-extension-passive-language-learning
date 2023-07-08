'use strict'

const SAMPLE_DATA = [{ 'original': 'home', 'translation': '家' }, {
  'original': 'person', 'translation': '人'
}, { 'original': 'left', 'translation': '左' }, { 'original': 'right', 'translation': '右' }, {
  'original': 'fire', 'translation': '火'
}, { 'original': 'good', 'translation': '好' }, { 'original': 'big', 'translation': '大' }, {
  'original': 'horse', 'translation': '马'
}, { 'original': 'small', 'translation': '小' }, { 'original': 'pig', 'translation': '猪' }]

const CURSE_WORDS = [
  'попка', 'пісюн', 'цицьки',
]

const TRANSLATION_LANG = 'zh-CN'

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


// TODO: Refactor
const audioVolumeLower = new MediaVolumeLower(0.6)
const mediaPauser = new MediaPauser()

const utterThis = new SpeechSynthesisUtterance()
let lastSpeakNode = null

const onFinished = () => {
  lastSpeakNode = null
  audioVolumeLower.higher()
  mediaPauser.play()
}

utterThis.lang = TRANSLATION_LANG
utterThis.rate = 0.7
utterThis.onend = onFinished
utterThis.onpause = onFinished
utterThis.onstart = () => {
  audioVolumeLower.lower()
  mediaPauser.pause()
}


class _Replacer {
  static CODE_MARKUP_TAGS = ['pre', 'code']
  static IGNORED_TAGS = [..._Replacer.CODE_MARKUP_TAGS, 'script', 'style', 'svg', 'head']

  static #isIgnored = (node) => (
    (node.nodeType === Node.TEXT_NODE || _Replacer.IGNORED_TAGS.includes(node.tagName.toLowerCase()))
    || _DOMUtils.isInputNode(node)
    || node.id === Tooltip.tooltipId
  )

  static #createMatchRegExp = (word) => (
    _NumberUtils.isNumeric(word)
      ? new RegExp(word, 'm')
      : new RegExp(`(?<!\\w)` + word + `[sи]?(?!\\w)`, 'im')
  )

  static #matches = (node, word) => !!node.textContent.match(_Replacer.#createMatchRegExp(word))

  static #hasIgnoredParent(node) {
    let parent = node.parentNode
    while (parent !== null) {
      if (_Replacer.#isIgnored(parent)) {
        return true
      }
      parent = parent.parentElement
    }
    return false
  }

  static #replaceNew_needs_refactoring_has_exceptions(element, original, translation) {
    try {
      if (!element) {
        return
      }

      const regex = _Replacer.#createMatchRegExp(original)

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
        var spanNode = document.createElement('span')

        const $fragment = new DocumentFragment()
        $fragment.append(translation)
        range.extractContents()
        spanNode.appendChild($fragment)

        spanNode.addEventListener('mouseover', (e) => {
          // Speak
          utterThis.text = e.currentTarget.textContent
          speechSynthesis.cancel()
          speechSynthesis.speak(utterThis)
          lastSpeakNode = e.currentTarget

          // Tooltip
          const rect = e.currentTarget.getBoundingClientRect()
          Tooltip.show(original, rect.right - rect.width / 2, rect.top)
        })
        spanNode.addEventListener('mouseout', (e) => {
          if (lastSpeakNode === e.currentTarget) {
            speechSynthesis.pause()
          }
          Tooltip.hide()
        })

        range.insertNode(spanNode)

        nodes = getNodes()
        text = ''
        for (var i = 0; i < nodes.length; ++i)
          text += nodes[i].textNode.nodeValue

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
      return _Replacer.#matches(rootNode, word) ? [rootNode] : []
    }

    let queue = [rootNode], curr
    const nodes = []

    while (curr = queue.pop()) {
      if (curr.nodeType !== Node.ELEMENT_NODE && curr.nodeType !== Node.TEXT_NODE) {
        continue
      }

      if (curr.nodeType !== Node.TEXT_NODE && _Replacer.#isIgnored(curr)) {
        continue
      }

      for (const childNode of curr.childNodes) {

        if (childNode.nodeType === Node.TEXT_NODE) {
          if (_Replacer.#matches(childNode, word)) {
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
      const nodesWithWord = _Replacer.#findTextNodesByWord(original, rootNode)

      for (const node of nodesWithWord) {
        if (!_Replacer.#hasIgnoredParent(node)) {
          _Replacer.#replace(node, original, translation)
          if (rootNode.parentNode && rootNode.parentNode !== document) {
            rootNode = rootNode.parentNode
          }
        }
      }
    }

  }

}

class DOMChangesObserverReplacer extends _Replacer {
  static #MutationObserver = window.MutationObserver || window.WebKitMutationObserver
  static #dictionary

  static #observer = new DOMChangesObserverReplacer.#MutationObserver(function (mutations) {
    // To prevent an infinite loop after replaced the text, because it'd be a mutation.
    // Thanks to https://github.com/marcioggs/text-changer-chrome-extension/blob/master/scripts/changeText.js#L61
    DOMChangesObserverReplacer.#observer.disconnect()

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          DOMChangesObserverReplacer.replaceWords(DOMChangesObserverReplacer.#dictionary, node)
        }
      } else {
        DOMChangesObserverReplacer.replaceWords(DOMChangesObserverReplacer.#dictionary, mutation.target)
      }
    })

    DOMChangesObserverReplacer.#startObserving(DOMChangesObserverReplacer.#observer)
  })

  static #startObserving = (observer) => {
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, })
  }

  static setDictionary(dictionary) {
    DOMChangesObserverReplacer.#dictionary = dictionary
    DOMChangesObserverReplacer.replaceWords(DOMChangesObserverReplacer.#dictionary, document.body)
  }

  static enable(dictionary) {
    if (dictionary) {
      DOMChangesObserverReplacer.setDictionary(dictionary)
    }

    DOMChangesObserverReplacer.#startObserving(DOMChangesObserverReplacer.#observer)
  }
}


const mediaVolumeLower = new MediaVolumeLower(0.6)

const utterThis2 = new SpeechSynthesisUtterance(this.textContent)

utterThis2.lang = TRANSLATION_LANG
utterThis2.rate = 1.2
utterThis2.onend = () => mediaVolumeLower.higher()
utterThis2.onpause = () => mediaVolumeLower.higher()
// utterThis2.onboundary = () => mediaVolumeLower.lower()
utterThis2.onstart = () => mediaVolumeLower.lower()


class YoutubeSubtitlesSpeech {
  static #scriptInjected = false
  static #enabled = false
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


  static #onEngine = () => {
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
            speechSynthesis.cancel()
            console.log('speaking: ', text, ' as :', translation)
            utterThis2.text = translation
            speechSynthesis.speak(utterThis2)
          }
        }
      }

      if (YoutubeSubtitlesSpeech.#enabled) {
        requestAnimationFrame(frame)
      }
    }

    if (YoutubeSubtitlesSpeech.#enabled) {
      requestAnimationFrame(frame)
    }
  }

  static #onEngineCurseWords = () => {
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
          speechSynthesis.cancel()
          utterThis2.text = textCursified
          speechSynthesis.speak(utterThis2)
        }
      }

      if (YoutubeSubtitlesSpeech.#enabled) {
        requestAnimationFrame(frame)
      }
    }

    if (YoutubeSubtitlesSpeech.#enabled) {
      requestAnimationFrame(frame)
    }
  }

  static #injectYoutubeAPIExposer = () => {
    const n = document.createElement('script')
    n.id = YoutubeSubtitlesSpeech.scriptId
    document.documentElement.append(n)
    n.src = chrome.runtime.getURL('webpage.bundle.js')
    n.defer = true
    YoutubeSubtitlesSpeech.#scriptInjected = true
  }

  static #messageHandler = (e) => {
    if (e.data.type === 'pll-update-subtitles') {
      if (e.data.data) {
        YoutubeSubtitlesSpeech.#captionUrl = e.data.data
        YoutubeSubtitlesSpeech.#downloadCaptions()
      }
    }
  }

  static #onListenMessages = () => {
    window.addEventListener('message', YoutubeSubtitlesSpeech.#messageHandler)
  }

  static #offListenMessages = () => {
    window.removeEventListener('message', YoutubeSubtitlesSpeech.#messageHandler)
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

      if (!YoutubeSubtitlesSpeech.#scriptInjected) {
        YoutubeSubtitlesSpeech.#injectYoutubeAPIExposer()
      }

      YoutubeSubtitlesSpeech.#onListenMessages()

      YoutubeSubtitlesSpeech.#onEngine()
    }
  }

  static disable() {
    if (YoutubeSubtitlesSpeech.#enabled) {
      YoutubeSubtitlesSpeech.#offListenMessages()
      YoutubeSubtitlesSpeech.#enabled = false
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
  }

  static setLangsWithUpdate(langFrom, langTo) {
    if (YoutubeSubtitlesSpeech.#langFrom !== langFrom || YoutubeSubtitlesSpeech.#langTo !== langTo) {
      YoutubeSubtitlesSpeech.setLangs(langFrom, langTo)

      YoutubeSubtitlesSpeech.#downloadCaptions()
    }
  }
}

(async () => {
  const isIgnoredOrigin = (state) => state.config.ignoredOrigins.includes(clientInfo.origin)
  const isDisabled = (state) => state.config.disabledAtAll || isIgnoredOrigin(state)

  const dictionaryStoreManager = new Store('dictionary', SAMPLE_DATA, {
    version: '1',
  })

  const configStoreManager = new Store('config', {
    ignoredOrigins: [],
    youtubeAudioReplaceON: false,
    disabledAtAll: false,
    fromLang: 'en',
    toLang: null,
  }, {
    version: '1.2',
  })

  const state = {
    dictionary: await dictionaryStoreManager.load(),
    config: await configStoreManager.load(),
  }

  console.log(state)

  const clientInfo = {
    origin: window.location.origin,
  }

  Tooltip.inject()

  if (!isDisabled(state)) {
    YoutubeSubtitlesSpeech.enable(state.dictionary, state.config.fromLang, state.config.toLang)
    DOMChangesObserverReplacer.enable(state.dictionary)
  }

  dictionaryStoreManager.subscribe((dictionary) => {
    state.dictionary = dictionary

    DOMChangesObserverReplacer.setDictionary(dictionary)
    YoutubeSubtitlesSpeech.setDictionary(dictionary)
  })

  configStoreManager.subscribe((config) => {
    state.config = config

    YoutubeSubtitlesSpeech.setLangsWithUpdate(config.fromLang, config.toLang)
    utterThis.lang = config.toLang
    utterThis2.lang = config.toLang

    if (isDisabled(state)) {
      window.location.reload()
    } else {
      YoutubeSubtitlesSpeech.enable(state.dictionary, state.config.fromLang, state.config.toLang)
      DOMChangesObserverReplacer.enable(state.dictionary)
    }
  })

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'get-data': {
        sendResponse({ state, clientInfo })
        break
      }
      case 'set-data': {
        const { dictionary, config } = message.data
        dictionaryStoreManager.save(dictionary)
        configStoreManager.save(config)
        sendResponse(true)
        break
      }
    }
  })
})()