'use strict'

const SAMPLE_DATA_SMALL = [{
  original: 'pig', translation: '豕',
},]
const SAMPLE_DATA = [{ 'original': 'home', 'translation': '家' }, {
  'original': 'person', 'translation': '人'
}, { 'original': 'left', 'translation': '左' }, { 'original': 'right', 'translation': '右' }, {
  'original': 'fire', 'translation': '火'
}, { 'original': 'good', 'translation': '好' }, { 'original': 'big', 'translation': '大' }, {
  'original': 'horse', 'translation': '马'
}, { 'original': 'small', 'translation': '小' }, { 'original': 'pig', 'translation': '猪' }]

// Function to handle input debouncing
function debounce(func, delay) {
  let timer

  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => func(...args), delay)
  }
}

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

const IGNORED_TAGS = ['script', 'style', 'svg']

const findWord = (word) => {
  let queue = [document.body], curr
  const nodes = []

  while (curr = queue.pop()) {
    if (IGNORED_TAGS.includes(curr.tagName.toLowerCase())) {
      continue
    }
    if (!curr.textContent.toLowerCase().match(word)) {
      continue
    }
    for (var i = 0; i < curr.childNodes.length; ++i) {
      switch (curr.childNodes[i].nodeType) {
        case Node.TEXT_NODE : // 3
          if (curr.childNodes[i].textContent.toLowerCase().match(word)) {
            nodes.push(curr)
          }
          break
        case Node.ELEMENT_NODE : // 1
          queue.push(curr.childNodes[i])
          break
      }
    }
  }

  return nodes
}

const replaceTextInNode = (node, text, newText) => {
  node.textContent = node.textContent.replaceAll(new RegExp(text, 'gi'), newText)
}

const isInputNode = (node) => {
  var tagName = node.tagName.toLowerCase()
  if (tagName === 'textarea') return true
  if (tagName !== 'input') return false
  var type = node.getAttribute('type').toLowerCase(), // if any of these input types is not supported by a browser, it will behave as input type text.
    inputTypes = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week']
  return inputTypes.indexOf(type) >= 0
}

const replaceWords = (dictionary, config) => {
  for (let { original, translation } of dictionary) {
    const nodesWithWord = findWord(original)

    for (const node of nodesWithWord) {
      if (config.replaceInputValues || !isInputNode(node)) {
        replaceTextInNode(node, original, translation)
      }
    }
  }
}

const observeDOM = (function () {
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver

  return function (obj, callback) {
    if (!obj || obj.nodeType !== 1) return

    if (MutationObserver) {
      // define a new observer
      var mutationObserver = new MutationObserver(callback)

      // have the observer observe for changes in children
      mutationObserver.observe(obj, { childList: true, subtree: true })
      return mutationObserver
    }

    // browser support fallback
    else if (window.addEventListener) {
      obj.addEventListener('DOMNodeInserted', callback, false)
      // obj.addEventListener('DOMNodeRemoved', callback, false)
    }
  }
})();

(async () => {
  const replaceWordsDebounced = debounce(replaceWords, 500);

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

  replaceWords(dataLatest.dictionary, dataLatest.config)

  // Observe a specific DOM element:
  observeDOM(document.body, function (m) {
    var addedNodes = [], removedNodes = []

    m.forEach(record => record.addedNodes.length & addedNodes.push(...record.addedNodes))

    m.forEach(record => record.removedNodes.length & removedNodes.push(...record.removedNodes))

    replaceWordsDebounced(dataLatest.dictionary, dataLatest.config)
  });
})()