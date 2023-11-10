class Translator {
  static #API_URL = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl={from}&tl={to}&dt=t&q={text}'

  #fetchService
  #from
  #to

  constructor(fetchService, from, to) {
    this.setFetchServer(fetchService)
    this.updateLanguages(from, to)
  }

  #getApiUrl = (text) => Translator.#API_URL
    .replace('{from}', this.#from)
    .replace('{to}', this.#to)
    .replace('{text}', text)

  setFetchServer(fetchService) {
    this.#fetchService = fetchService
  }

  updateLanguages(from, to) {
    this.#from = from
    this.#to = to
  }

  getTranslation = async (text, options) => {
    const response = await this.#fetchService(this.#getApiUrl(text), options)
    const json = await response.json()
    return json[0]?.[0]?.[0] || ''
  }
}

export default Translator