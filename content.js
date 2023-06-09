'use strict'

const SAMPLE_DATA = [{ 'original': 'home', 'translation': '家' }, {
  'original': 'person', 'translation': '人'
}, { 'original': 'left', 'translation': '左' }, { 'original': 'right', 'translation': '右' }, {
  'original': 'fire', 'translation': '火'
}, { 'original': 'good', 'translation': '好' }, { 'original': 'big', 'translation': '大' }, {
  'original': 'horse', 'translation': '马'
}, { 'original': 'small', 'translation': '小' }, { 'original': 'pig', 'translation': '猪' }]

const storeManager = (key, defaultValue) => {
  return {
    load: () => {
      return chrome.storage.local.get([key]).then((result) => result[key] ?? defaultValue)
    }, save: (payload) => {
      return chrome.storage.local.set({ [key]: payload }).then(() => {
        console.log('Value is set')
      })
    },
  }
}

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
    ? new RegExp(word, 'g')
    : new RegExp(`(?<!\\w)` + word + `[sиы]?(?!\\w)`, 'gim')
)

const matches = (node, word) => node.textContent.match(createMatchRegExp(word))

class AudioVolumeLower {
  lowerValue
  loweredCollection = new Map()

  constructor(lowerValue) {
    this.lowerValue = lowerValue;
  }

  lower() {
    document.querySelectorAll('video, audio').forEach((el) => {
      if (!el.paused && el.volume > this.lowerValue) {
        this.loweredCollection.set(el, el.volume);
        el.volume = this.lowerValue;
      }
    })
  }
  higher() {
    for (const [element, initialVolume] of this.loweredCollection) {
      element.volume = initialVolume;
    }
  }
}

const audioVolumeLower = new AudioVolumeLower(0.6);

const utterThis = new SpeechSynthesisUtterance(this.textContent);
let utterThisLastNode = null;
utterThis.lang = 'zh-CN';
utterThis.rate = 0.8;

const onFinished = () => {
  audioVolumeLower.higher();
  utterThisLastNode = null;
}
utterThis.onend = onFinished;
utterThis.onpause = onFinished;

const showTooltip = (content, x, y) => {
  const $tooltip = document.getElementById('pll-tooltip')
  $tooltip.style.left = x + 'px';
  $tooltip.style.top = (y - 16) + 'px';
  
  const $tooltipContent = $tooltip.querySelector('.pll-tooltip-content')
  $tooltipContent.innerHTML = content;
}

const hideTooltip = () => {
  const $tooltip = document.getElementById('pll-tooltip')
  $tooltip.style.left = ''
}

// Needs refactoring
function replaceNew_needs_refactoring_has_exceptions(element, original, translation) {
 try {
   if (!element) {
     return
   }

   const regex = createMatchRegExp(original)

   var getNodes = function() {
     var nodes = [],
       offset = 0,
       node,
       nodeIterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT, null, false);

     while (node = nodeIterator.nextNode()) {
       nodes.push({
         textNode: node,
         start: offset,
         length: node.nodeValue.length
       });
       offset += node.nodeValue.length
     }
     return nodes;
   }

   var nodes = getNodes();
   if (!nodes.length)
     return;

   var text = "";
   for (var i = 0; i < nodes.length; ++i)
     text += nodes[i].textNode.nodeValue;

   for (let match of text.matchAll(regex)) {
     // Prevent empty matches causing infinite loops
     if (!match[0].length)
     {
       regex.lastIndex++;
       continue;
     }

     // Find the start and end text node
     var startNode = null, endNode = null;
     for (i = 0; i < nodes.length; ++i) {
       var node = nodes[i];

       if (node.start + node.length <= match.index)
         continue;

       if (!startNode)
         startNode = node;

       if (node.start + node.length >= match.index + match[0].length)
       {
         endNode = node;
         break;
       }
     }

     var range = document.createRange();
     range.setStart(startNode.textNode, match.index - startNode.start);
     range.setEnd(endNode.textNode, match.index + match[0].length - endNode.start);
     var spanNode = document.createElement("span");
     spanNode.className = "highlight";

     const $fragment = new DocumentFragment()
     $fragment.append(translation);
     range.extractContents()
     spanNode.appendChild($fragment);

     spanNode.addEventListener('mouseover', function (event) {
       utterThis.text = this.textContent;
       speechSynthesis.cancel()
       audioVolumeLower.lower();
       speechSynthesis.speak(utterThis);
       utterThisLastNode = this;
       const rect = this.getBoundingClientRect()
       showTooltip(original, rect.right - rect.width / 2, rect.top)
     })
     spanNode.addEventListener('mouseout', function () {
       if (utterThisLastNode === this) {
         speechSynthesis.pause()
       }
        hideTooltip()
     })

     range.insertNode(spanNode);

     nodes = getNodes();
   }
 } catch (e) {
   console.log(e)
   console.log(`%cUNEXPECTED ERROR: MINOR for future`, 'background: black; color: white;', error)
 }
}

const replace = (node, original, translation) => {
  replaceNew_needs_refactoring_has_exceptions(node.parentNode, original, translation)
  // node.textContent = node.textContent.replaceAll(createMatchRegExp(original), translation)
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

    if (curr.nodeType !== Node.TEXT_NODE && IGNORED_TAGS.includes(curr.tagName.toLowerCase())) {
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

function hasEditableParent(node) {
  let parent = node.parentNode
  while (parent !== null) {
    if (isInputNode(parent)) {
      return true
    }
    parent = parent.parentElement
  }
  return false
}

const INPUT_TAGS = ['textarea', 'input', 'select']
const CLASSNAME_GITLAB_DIFF_CONTENT = 'diff-content'

const replaceWords = (dictionary, config, rootNode) => {

  for (let { original, translation } of dictionary) {
    const nodesWithWord = findTextNodesByWord(original, rootNode)

    for (const node of nodesWithWord) {
      if (!hasEditableParent(node)) {
        replace(node, original, translation)
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
        border-radius: 3px;
        border: 1px solid #ddd;
        background: linear-gradient(0deg, rgba(249, 255, 0, 1) 12%, rgba(0, 224, 255, 1) 82%);
        box-shadow: 0 0 4px 1px yellow;

        text-align: center;
        font-size: 18px;
        line-height: 1.2;


        background-color: #fff;
        color: #fff;
        text-shadow: -1px 0 rgba(0, 0, 0, 0.4), 0 1px rgba(0, 0, 0, 0.4), 1px 0 rgba(0, 0, 0, 0.4), 0 -1px rgba(0, 0, 0, 0.4);
  }

.pll-tooltip-arrow {
   position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 50%);
  pointer-events: none;

  width: 0;
  border-top: 5px solid #000;
  border-top: 5px solid hsla(0, 0%, 20%, 0.9);
  border-right: 5px solid transparent;
  border-left: 5px solid transparent;
  font-size: 0;
  line-height: 0;
}`
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
  injectHTML();
  injectStyles();
}

(async () => {
  injectTooltip();

  const dictionaryStoreManager = storeManager('dictionary', SAMPLE_DATA)
  const configStoreManager = storeManager('config', {
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
})()