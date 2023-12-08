class ScriptManager {
  static injectScriptToPage = (src) => {
    const n = document.createElement('script')
    n.src = src

    // {async = false} because by default it is {true},
    // but we need to preserve the behaviour like when writing in "index.html" <script> explicitly,
    // so we change it back {async = false}
    n.async = false
    // ===============================================================

    document.body.append(n)

    return new Promise((resolve) => {
      n.onload = resolve
    })
  }
}

export class Injector {
  constructor(type, injections) {
    this.type = type
    this.injections = injections
  }

  cache = {}

  inject = (name) => {
    const url = this.injections[name]

    if (!url) {
      throw new Error(`${this.type} ${name} not found on ${url}.`)
    }

    if (this.cache[name]) {
      return this.cache[name]
    }

    this.cache[name] = ScriptManager.injectScriptToPage(url)

    return this.cache[name]
  }
}