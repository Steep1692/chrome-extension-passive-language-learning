// This module fakes the chrome object in the content script
// so that the same code can be used in the extension and on the website

const fakeChromeObject = {
  listener: null,
  tabs: {
    query: (queryInfo, callback) => {
      return [{ id: 1 }]
    },
    sendMessage: async (tabId, message, callback) => {
      return new Promise((resolve) => {
        fakeChromeObject.listener && fakeChromeObject.listener(message, {}, (...args) => {
          callback && callback(...args)
          resolve(...args)
        })
      })
    },
  },
  runtime: {
    getURL: (path) => {
      return '/' + path
    },
    onMessage: {
      addListener: (callback) => {
        fakeChromeObject.listener = callback
      }
    }
  },
  storage: {
    listeners: [],
    local: {
      get: async () => {
        const items = {}

        for (const key in localStorage) {
          try {
            items[key] = JSON.parse(localStorage[key])
          } catch (e) {}
        }

        return items
      },
      set: async (items, callback) => {
        const changes = {}

        for (const key in items) {
          localStorage[key] = JSON.stringify(items[key])
          changes[key] = {
            newValue: items[key],
          }
        }

        callback && callback(changes)
        for (const listener of chrome.storage.listeners) {
          listener(changes, 'local')
        }
      },
      remove: async (key, callback) => {
        localStorage.removeItem(key)
        callback && callback()
      },
    },
    onChanged: {
      addListener: (callback) => {
        fakeChromeObject.storage.listeners.push(callback)
      }
    },
  }
}

function merge_options(obj1, obj2) {
  for (const key in obj2) {
    if (obj1[key] && typeof obj1[key] === 'object') {
      merge_options(obj1[key], obj2[key])
    } else {
      obj1[key] = obj2[key]
    }
  }
}

if (!('chrome' in window)) {
  chrome = {}
  window.chrome = chrome
}

merge_options(window.chrome, fakeChromeObject)