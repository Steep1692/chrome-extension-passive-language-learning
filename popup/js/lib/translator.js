class Translator {
  static #API_URL = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl={from}&tl={to}&dt=t&q={text}'

  #from
  #to

  constructor(from, to) {
    this.updateLanguages(from, to)
  }

  #getApiUrl = (text) => Translator.#API_URL
    .replace('{from}', this.#from)
    .replace('{to}', this.#to)
    .replace('{text}', text)

  updateLanguages(from, to) {
    this.#from = from
    this.#to = to
  }

  getTranslation = async (text, options) => {
    const response = await fetch(this.#getApiUrl(text), options)
    const json = await response.json()
    return json[0][0][0]
  }
}