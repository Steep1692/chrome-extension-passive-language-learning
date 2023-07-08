class ContentScriptApi {
  async #emit(message) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    return chrome.tabs.sendMessage(tab.id, message)
  }

  getData() {
    return this.#emit({ type: 'get-data' })
  }

  async setData(data) {
    return await this.#emit({ type: 'set-data', data, })
  }
}