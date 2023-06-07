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

const IGNORED_TAGS = ['script', 'style', 'svg']

const findNodesWithWord = (word, rootNode = document.body) => {
  if (rootNode.nodeType === Node.TEXT_NODE) {
    return rootNode.textContent?.toLowerCase().match(word) ? [rootNode] : []
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
  if (node.nodeType === Node.TEXT_NODE) {
    return false
  }

  var tagName = node.tagName.toLowerCase()
  if (tagName === 'textarea') return true
  if (tagName !== 'input') return false
  var type = node.getAttribute('type').toLowerCase(), // if any of these input types is not supported by a browser, it will behave as input type text.
    inputTypes = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week']
  return inputTypes.indexOf(type) >= 0
}

const replaceWords = (dictionary, config, rootNode) => {
  for (let { original, translation } of dictionary) {
    const nodesWithWord = findNodesWithWord(original, rootNode)

    for (const node of nodesWithWord) {
      if (config.replaceInputValues || !isInputNode(node)) {
        replaceTextInNode(node, original, translation)
      }
    }
  }
}

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver

function startObserving(observer) {
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, })
}

(async () => {
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