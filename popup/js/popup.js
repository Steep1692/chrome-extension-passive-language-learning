class ContentScriptEmitter {
  async #emit(message) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    return chrome.tabs.sendMessage(tab.id, message)
  }

  getData() {
    return this.#emit({ type: 'get-data' })
  }

  setData(data) {
    return this.#emit({ type: 'set-data', data, })
  }
}

class Store {
  dictionary
  config
  onDataUpdated

  constructor(dictionary, config, { onDataUpdated }) {
    this.dictionary = dictionary
    this.config = config

    this.onDataUpdated = onDataUpdated

    this.onDataUpdated(this, { init: true })

    this.deleteItem = this.deleteItem.bind(this)
    this.addItem = this.addItem.bind(this)
    this.editItem = this.editItem.bind(this)
  }

  addItem(payload) {
    this.dictionary.push(payload)

    this.onDataUpdated(this, { added: true })
  }

  editItem(index, payload) {
    this.dictionary[index] = {
      ...this.dictionary[index],
      ...payload,
    }

    this.onDataUpdated(this)
  }

  deleteItem(index) {
    this.dictionary.splice(index, 1)

    this.onDataUpdated(this)
  }
}

const classNameHidden = 'hidden'

// Function to generate field
const createField = ({ index, className, fieldKey, textContent }, {
  onEdit,
}) => {
  const $label = document.createElement('span')
  $label.classList.add('field', className)
  $label.textContent = textContent

  const showLabel = () => {
    $input.classList.add(classNameHidden)
    $label.classList.remove(classNameHidden)
  }
  const showInput = () => {
    $label.classList.add(classNameHidden)
    $input.classList.remove(classNameHidden)
  }

  function escapeHandler(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      showLabel()
      document.removeEventListener('keydown', escapeHandler)
    }
  }

  $label.addEventListener('click', function () {
    const $input = $label.nextSibling

    showInput()
    $input.focus()

    document.addEventListener('keydown', escapeHandler)
  })

  const $input = document.createElement('input')
  $input.classList.add('todo-item-input', classNameHidden)
  $input.type = 'text'
  $input.value = textContent
  $input.addEventListener('change', () => $input.hasChanged = true);
  $input.addEventListener('focus', () => $input.hasChanged = false);
  const onEditSuccess = () => {
    document.removeEventListener('keydown', escapeHandler)

    showLabel();

    if ($input.hasChanged) {
      const newValue = $input.value

      $label.textContent = newValue
      onEdit(index, { [fieldKey]: newValue })
    }
  };
  $input.addEventListener('blur', onEditSuccess)
  $input.addEventListener('keydown', (event) => {
    if(event.key === 'Enter') {
      onEditSuccess();
    }
  })

  return {
    $field: $label,
    $input
  }
}

// Function to generate list
const renderList = (dictionary, {
  onDelete,
  onEdit,
  scrollToBottom,
}) => {
  const $list = document.getElementById('todo-list')
  $list.innerHTML = '' // Clear existing items

  // Loop through todoItems array and create HTML for each item
  for (let i = 0; i < dictionary.length; i++) {
    const item = dictionary[i]

    const $item = document.createElement('li')
    $item.classList.add('todo-item')

    if (i %2 !== 0) {
      $item.classList.add('odd')
    }

    const $inner = document.createElement('li')
    $inner.classList.add('todo-item-inner')

    for (let field in item) {
      const $wrap = document.createElement('div')
      $wrap.classList.add('todo-item-field-wrap')

      const { $field, $input } = createField({
        index: i,
        className: field,
        fieldKey: field,
        textContent: item[field],
      }, { onEdit })
      $wrap.appendChild($field)
      $wrap.appendChild($input)
      $inner.appendChild($wrap)
    }

    const $deleteBtn = document.createElement('button')
    $deleteBtn.classList.add('delete-btn')
    $deleteBtn.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAiElEQVR4nOWTMQqAMAxF33Ec9A7SSW/l6Pl0cNdByCXikqEUl2qLWgOBkND/4CeFv8QAaJDjVTG9mc8DygjNbY8WBViAFti9ngAOmFIAnPVqExarsdltgHiCdVBLqh0I0HjzKrDs3QDJbZHLveTZhOTkTOdPfDTNAdguiK8xgN4eaIR4FwP4ThwXTNMZQ+neXwAAAABJRU5ErkJggg==">'
    $deleteBtn.addEventListener('click', () => {
      confirm('Are you sure you want to delete this item?') && onDelete(i);
    })

    $inner.appendChild($deleteBtn)
    $item.appendChild($inner)
    $list.appendChild($item)
  }

  if (scrollToBottom) {
    $list.scroll({
      top: $list.scrollHeight,
      behavior: 'smooth',
    })
  }
}

// Function to handle form submission
function handleFormSubmit(event, { onAdd }) {
  event.preventDefault()

  const $originalInput = document.getElementById('original-input')
  const $translationInput = document.getElementById('translation-input')

  onAdd({
    original: $originalInput.value,
    translation: $translationInput.value
  })

  // Reset form inputs
  $originalInput.value = ''
  $translationInput.value = ''
}

// Function to handle input debouncing
function debounce(func, delay) {
  let timer

  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => func(...args), delay)
  }
}

// Function to fetch translation from API
const fetchTranslation = async (value, options) => {
  const url = 'https://google-translate1.p.rapidapi.com/language/translate/v2'
  const init = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept-Encoding': 'application/gzip',
      'X-RapidAPI-Key': '3868ee5fa6msh294268e8d9a4614p15a889jsn97a17ca2d246',
      'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
    },
    body: new URLSearchParams({
      q: value,
      target: 'zh',
      source: 'en'
    }),
    ...options,
  }

  try {
    const response = await fetch(url, init)
    const json = await response.json()
    return json.data.translations[0].translatedText
  } catch (error) {
    console.error(error)
  }
}

// appends bubble elements to header, to not write them manually


const main = async () => {
  const contentScriptEmitter = new ContentScriptEmitter()

  const { dictionary, config } = await contentScriptEmitter.getData()

  const store = new Store(dictionary, config, {
    onDataUpdated: (store, { init, added } = {}) => {
      renderList(store.dictionary, {
        onEdit: store.editItem.bind(store),
        onDelete: store.deleteItem.bind(store),
        scrollToBottom: added,
      })

      if (!init) {
        contentScriptEmitter.setData({
          dictionary: store.dictionary,
          config: store.config,
        })
      }
    },
  })

  const $form = document.getElementById('add-todo-form')
  const $originalInput = document.getElementById('original-input')
  const $translationInput = document.getElementById('translation-input')

  $form.addEventListener('submit', (event) => {
    handleFormSubmit(event, {
      onAdd: (payload) => {
        store.addItem(payload)
        $originalInput.focus()
      },
    })
  })

  let cancelFetchTranslationSignal;
  const originalPlaceholder = $translationInput.placeholder
  let isLastTransSetFromAPI = false

  $originalInput.addEventListener('input', debounce(async () => {
    const value = $originalInput.value.trim()
    const translateValue = $translationInput.value.trim()

    if (value !== '' && (translateValue === '' || isLastTransSetFromAPI)) {
      $translationInput.placeholder = 'Loading…'
      $translationInput.value = ''

      const controller = new AbortController()
      cancelFetchTranslationSignal = controller.signal
      const translationString = await fetchTranslation(value, {
        signal: cancelFetchTranslationSignal,
      });

      $translationInput.value = translationString;
      $translationInput.placeholder = originalPlaceholder
      isLastTransSetFromAPI = true
      cancelFetchTranslationSignal = null
    }
  }, 500))

  $translationInput.addEventListener(('input'), () => {
    if (cancelFetchTranslationSignal) {
      cancelFetchTranslationSignal.abort()
    }

    isLastTransSetFromAPI = false
  })

  $originalInput.focus()
}

// Global listeners
window.addEventListener('DOMContentLoaded', main)