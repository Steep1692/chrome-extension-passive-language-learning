class ContentScriptApi {
  static async #emit(message) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    return chrome.tabs.sendMessage(tab.id, message)
  }

  static getData() {
    return ContentScriptApi.#emit({ type: 'get-data' })
  }

  static async setData(data) {
    return await ContentScriptApi.#emit({ type: 'set-data', data, })
  }

  static async addWord(word) {
    return await ContentScriptApi.#emit({ type: 'add-word', data: { word }, })
  }
}