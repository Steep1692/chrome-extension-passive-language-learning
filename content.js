'use strict'

const SAMPLE_DATA = [{ 'original': 'home', 'translation': '家' }, {
  'original': 'person', 'translation': '人'
}, { 'original': 'left', 'translation': '左' }, { 'original': 'right', 'translation': '右' }, {
  'original': 'fire', 'translation': '火'
}, { 'original': 'good', 'translation': '好' }, { 'original': 'big', 'translation': '大' }, {
  'original': 'horse', 'translation': '马'
}, { 'original': 'small', 'translation': '小' }, { 'original': 'pig', 'translation': '猪' }]

const TRANSLATION_LANG = 'zh-CN'


class StoreManager {
  constructor(key, defaultValue) {
    this.key = key
    this.defaultValue = defaultValue
  }

  load() {
    return chrome.storage.local.get([this.key]).then((result) => result[this.key] ?? this.defaultValue)
  }

  save(payload) {
    return chrome.storage.local.set({ [this.key]: payload })
  }
}

const isNumberBetweenEquals = (number, min, max) => {
  return number >= min && number <= max;
};

const CODE_MARKUP_TAGS = ['pre', 'code']
const IGNORED_TAGS = [...CODE_MARKUP_TAGS, 'script', 'style', 'svg']

const isIgnored = (node) => (
  (node.nodeType === Node.TEXT_NODE || IGNORED_TAGS.includes(node.tagName.toLowerCase()))
  || isInputNode(node)
  || node.id === 'pll-tooltip'
)

const isNumeric = (str) => /^\d+$/.test(str)

const createMatchRegExp = (word) => (
  isNumeric(word)
    ? new RegExp(word, 'm')
    : new RegExp(`(?<!\\w)` + word + `[sиы]?(?!\\w)`, 'im')
)

const matches = (node, word) => node.textContent.match(createMatchRegExp(word))

const getVideoElements = () => document.querySelectorAll('video')
const getPlayingVideoElements = () => [...getVideoElements()].filter((el) => !el.paused)
const getAudioElements = () => document.querySelectorAll('audio')
const getPlayingAudioElements = () => [...getAudioElements()].filter((el) => !el.paused)

class MediaVolumeLower {
  lowerValue
  loweredCollection = new Map()

  constructor(lowerValue) {
    this.lowerValue = lowerValue
  }

  #lowerIfNeeded($el) {
    if ($el.volume > this.lowerValue) {
      this.loweredCollection.set($el, $el.volume)
      $el.volume = this.lowerValue
    }
  }

  lower() {
    for (const $el of getPlayingAudioElements()) {
      this.#lowerIfNeeded($el)
    }
    for (const $el of getPlayingVideoElements()) {
      this.#lowerIfNeeded($el)
    }
  }

  higher() {
    for (const [$element, initialVolume] of this.loweredCollection) {
      $element.volume = initialVolume
    }
  }
}

class MediaPauser {
  affectedCollection = []

  #pauseIfNeeded($el) {
    if (!$el.paused) {
      this.affectedCollection.push($el)
      $el.pause()
    }
  }

  pause() {
    for (const $el of getPlayingAudioElements()) {
      this.#pauseIfNeeded($el)
    }
    for (const $el of getPlayingVideoElements()) {
      this.#pauseIfNeeded($el)
    }
  }

  play() {
    for (const $element of this.affectedCollection) {
      $element.play()
    }
  }
}

const audioVolumeLower = new MediaVolumeLower(0.6)
const mediaPauser = new MediaPauser()

const utterThis = new SpeechSynthesisUtterance()
let utterThisLastNode = null

const onFinished = () => {
  utterThisLastNode = null
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

const showTooltip = (content, x, y) => {
  const $tooltip = document.getElementById('pll-tooltip')
  $tooltip.style.left = x + 'px'
  $tooltip.style.top = (y - 16) + 'px'

  const $tooltipContent = $tooltip.querySelector('.pll-tooltip-content')
  $tooltipContent.innerHTML = content
}

const hideTooltip = () => {
  const $tooltip = document.getElementById('pll-tooltip')
  $tooltip.style.left = ''
}

function replaceNew_needs_refactoring_has_exceptions(element, original, translation) {
  try {
    if (!element) {
      return
    }

    const regex = createMatchRegExp(original)

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

      spanNode.addEventListener('mouseover', function (event) {
        utterThis.text = this.textContent
        speechSynthesis.cancel()
        speechSynthesis.speak(utterThis)
        utterThisLastNode = this
        const rect = this.getBoundingClientRect()
        showTooltip(original, rect.right - rect.width / 2, rect.top)
      })
      spanNode.addEventListener('mouseout', function () {
        if (utterThisLastNode === this) {
          speechSynthesis.pause()
        }
        hideTooltip()
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

const replace = (node, original, translation) => {
  return replaceNew_needs_refactoring_has_exceptions(node.parentNode, original, translation)
}

const findTextNodesByWord = (word, rootNode) => {
  if (rootNode.nodeType === Node.TEXT_NODE) {
    return matches(rootNode, word) ? [rootNode] : []
  }

  let queue = [rootNode], curr
  const nodes = []

  while (curr = queue.pop()) {
    if (curr.nodeType !== Node.ELEMENT_NODE && curr.nodeType !== Node.TEXT_NODE) {
      continue
    }

    if (curr.nodeType !== Node.TEXT_NODE && isIgnored(curr)) {
      continue
    }

    for (const childNode of curr.childNodes) {

      if (childNode.nodeType === Node.TEXT_NODE) {
        if (matches(childNode, word)) {
          nodes.push(childNode)
        }
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        // (Idea for possible optimisation) Don't go too deep if the word is not in the element node.
        if (!matches(childNode, word)) {
          continue
        }

        queue.push(childNode)
      }

    }
  }

  return nodes
}

const isInputNode = (node) => {
  return (
    INPUT_TAGS.includes(node.tagName.toLowerCase())
    || node.contentEditable === 'true'
    || node.role === 'textbox'
    || node.role === 'listbox'
  )
}

function hasIgnoredParent(node) {
  let parent = node.parentNode
  while (parent !== null) {
    if (isIgnored(parent)) {
      return true
    }
    parent = parent.parentElement
  }
  return false
}

const INPUT_TAGS = ['textarea', 'input', 'select']

const replaceWords = (dictionary, config, rootNode) => {

  for (let { original, translation } of dictionary) {
    const nodesWithWord = findTextNodesByWord(original, rootNode)

    for (const node of nodesWithWord) {
      if (!hasIgnoredParent(node)) {
        replace(node, original, translation)
        if (rootNode.parentNode && rootNode.parentNode !== document) {
          rootNode = rootNode.parentNode
        }
      }
    }
  }

}

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver

function startObserving(observer) {
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, })
}

const injectStyles = () => {
  const $style = document.createElement('style')
  $style.innerHTML = `
      .pll-tooltip {
          z-index: 9999999;
          position: fixed;
          left: -200px;
        }
        
      .pll-tooltip-content {
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

.pll-tooltip-arrow {
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
  animation: bounce 0.5s ease infinite;
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

const injectHTML = () => {
  const $tooltip = document.createElement('div')
  $tooltip.id = 'pll-tooltip'
  $tooltip.classList.add('pll-tooltip')
  $tooltip.innerHTML = `<div class="pll-tooltip-arrow"></div>
        <div class="pll-tooltip-content"></div>`
  document.body.appendChild($tooltip)
}

const injectTooltip = () => {
  injectHTML()
  injectStyles()
}

const experimental_feature_speakSubtitlesTranslatedWords = async () => {
  const dictionaryMap = dataLatest.dictionary.reduce((acc, { original, translation }) => {
    acc[original] = translation
    return acc
  }, {})

  const videoSubtitlesSegments = await fetch("\n" +
    "https://www.youtube.com/api/timedtext?v=06sDgp3wZUc&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1686358692&sparams=ip%2Cipbits%2Cexpire%2Cv%2Ccaps%2Copi%2Cxoaf&signature=AB9096C5C7FB8E6AB447F59669274454E6A4882E.454C73185D3CCB253365C067A60668007FBB3899&key=yt8&kind=asr&lang=en&fmt=json3&xorb=2&xobt=3&xovt=3&cbrand=apple&cbr=Chrome&cbrver=114.0.0.0&c=WEB&cver=2.20230608.02.00&cplayer=UNIPLAYER&cos=Macintosh&cosver=10_15_7&cplatform=DESKTOP")
    .then(r => r.json())
    .then((result) => {
      const out = [];

      let event, nextEvent;
      for (let i = 0; i < result.events.length; i++) {
        event = result.events[i]

        if (!event.segs?.length) {
          continue
        }

        nextEvent = result.events[i + 1]

        const start = event.tStartMs;
        const end = nextEvent?.tStartMs !== undefined ? nextEvent.tStartMs : (event.tStartMs + event.dDurationMs);

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
    })

  const mediaVolumeLower = new MediaVolumeLower(0)

  const utterThis = new SpeechSynthesisUtterance(this.textContent)

  utterThis.lang = TRANSLATION_LANG
  utterThis.rate = 1.35
  utterThis.onend = () => mediaVolumeLower.higher()
  utterThis.onpause = () => mediaVolumeLower.higher()
  utterThis.onboundary = () => mediaVolumeLower.lower()

  for (const $video of getVideoElements()) {
    let playing = !$video.paused

    let lastText
    const frame = () => {
      const currentTimeMs = $video.currentTime * 1000 + 180

      const segment = videoSubtitlesSegments.find(
        (s) => isNumberBetweenEquals(currentTimeMs, s.start, s.end)
      )
      const text = segment?.text

      if (text && lastText !== text) {
        lastText = text

        const textNormalized = segment?.text.trim().toLowerCase().replace(/[sиы]$/, '')
        const translation = dictionaryMap[textNormalized]

        if (translation) {
          speechSynthesis.cancel()
          console.log('speaking: ', text, ' as :', translation)
          utterThis.text = translation
          speechSynthesis.speak(utterThis)
        }
      }

      if (playing) {
        requestAnimationFrame(frame)
      }
    }

    $video.addEventListener('play', () => {
      playing = true
      requestAnimationFrame(frame)
    })
    $video.addEventListener('pause', () => {
      playing = false
    })
    $video.addEventListener('ended', () => {
      playing = false
    })

    requestAnimationFrame(frame)
  }
};


(async () => {
  injectTooltip()

  const dictionaryStoreManager = new StoreManager('dictionary', SAMPLE_DATA)
  const configStoreManager = new StoreManager('config', {
    replaceInputValues: false,
  })

  let dataLatest = {
    dictionary: await dictionaryStoreManager.load(),
    config: await configStoreManager.load(),
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.table(message)

    switch (message.type) {
      case 'ping': {
        sendResponse(true)
        break
      }
      case 'get-data': {
        sendResponse(dataLatest)
        break
      }
      case 'set-data': {
        const { dictionary, config } = message.data
        dictionaryStoreManager.save(dictionary)
        configStoreManager.save(config)
        dataLatest = message.data
        replaceWords(dictionary, config)
        sendResponse(true)
        break
      }
    }
  })

  replaceWords(dataLatest.dictionary, dataLatest.config, document.body)

  const observer = new MutationObserver(function (mutations) {
    // To prevent an infinite loop after replaced the text, because it'd be a mutation.
    // Thanks to https://github.com/marcioggs/text-changer-chrome-extension/blob/master/scripts/changeText.js#L61
    observer.disconnect()

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          replaceWords(dataLatest.dictionary, dataLatest.config, node)
        }
      } else {
        replaceWords(dataLatest.dictionary, dataLatest.config, mutation.target)
      }
    })

    startObserving(observer)
  })

  startObserving(observer)

  if (false) {
    experimental_feature_speakSubtitlesTranslatedWords();
  }
})()