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

const CODE_MARKUP_TAG = 'pre'
const IGNORED_TAGS = [CODE_MARKUP_TAG, 'script', 'style', 'svg']

const findTextNodesByWord = (word, rootNode) => {
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
        case Node.TEXT_NODE :
          if (curr.childNodes[i].textContent.toLowerCase().match(word)) {
            nodes.push(curr.childNodes[i])
          }
          break
        case Node.ELEMENT_NODE :
          queue.push(curr.childNodes[i])
          break
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
    || node.classList.contains(CLASSNAME_GITLAB_DIFF_CONTENT)
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
        node.textContent = node.textContent.replaceAll(new RegExp(original, 'gi'), translation)
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