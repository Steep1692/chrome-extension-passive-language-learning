class ContentScriptApi {
  static async #emit(message) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    return chrome.tabs.sendMessage(tab.id, message)
  }

  static getInitStateData() {
    return ContentScriptApi.#emit({ type: 'get-init-state-data' })
  }

  static async setData(data) {
    return await ContentScriptApi.#emit({ type: 'set-data', data, })
  }

  static async addWord(word) {
    return await ContentScriptApi.#emit({ type: 'add-word', data: { word }, })
  }
}

globalThis.ContentScriptApi = ContentScriptApi