(() => {

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
        event.preventDefault()
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
    $input.addEventListener('change', () => $input.hasChanged = true)
    $input.addEventListener('focus', () => $input.hasChanged = false)
    const onEditSuccess = () => {
      document.removeEventListener('keydown', escapeHandler)

      showLabel()

      if ($input.hasChanged) {
        const newValue = $input.value

        $label.textContent = newValue
        onEdit(index, { [fieldKey]: newValue })
      }
    }
    $input.addEventListener('blur', onEditSuccess)
    $input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        onEditSuccess()
      }
    })

    return {
      $field: $label, $input
    }
  }

// Function to generate list
  const renderList = (shadowRoot, dictionary, {
    onDelete, onEdit, scrollToBottom,
  }) => {
    const $list = shadowRoot.getElementById('todo-list')
    $list.innerHTML = '' // Clear existing items

    // Loop through todoItems array and create HTML for each item
    for (let i = 0; i < dictionary.length; i++) {
      const item = dictionary[i]

      const $item = document.createElement('li')
      $item.classList.add('todo-item')

      if (i % 2 !== 0) {
        $item.classList.add('odd')
      }

      const $inner = document.createElement('li')
      $inner.classList.add('todo-item-inner')

      for (let field in item) {
        const $wrap = document.createElement('div')
        $wrap.classList.add('todo-item-field-wrap')

        const { $field, $input } = createField({
          index: i, className: field, fieldKey: field, textContent: item[field],
        }, { onEdit })
        $wrap.appendChild($field)
        $wrap.appendChild($input)
        $inner.appendChild($wrap)
      }

      const $deleteBtn = document.createElement('button')
      $deleteBtn.classList.add('delete-btn')
      $deleteBtn.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAiElEQVR4nOWTMQqAMAxF33Ec9A7SSW/l6Pl0cNdByCXikqEUl2qLWgOBkND/4CeFv8QAaJDjVTG9mc8DygjNbY8WBViAFti9ngAOmFIAnPVqExarsdltgHiCdVBLqh0I0HjzKrDs3QDJbZHLveTZhOTkTOdPfDTNAdguiK8xgN4eaIR4FwP4ThwXTNMZQ+neXwAAAABJRU5ErkJggg==">'
      $deleteBtn.addEventListener('click', () => {
        confirm('Are you sure you want to delete this item?') && onDelete(i)
      })

      $inner.appendChild($deleteBtn)
      $item.appendChild($inner)
      $list.appendChild($item)
    }

    if (scrollToBottom) {
      $list.scroll({
        top: $list.scrollHeight, behavior: 'smooth',
      })
    }
  }

  const html = ({ t }) => {
    return `
      <section class="list">
              <div class="list-header">
                  <div><b>#</b></div>
                  <div><b>${t.original}</b></div>
                  <div><b>${t.translation}</b></div>
                  <div><b>${t.actions}</b></div>
              </div>
              <ol id="todo-list">
                  <!-- Todo items will be dynamically added here -->
              </ol>
          </section>
    `
  }

  const translates = {
    original: 'Original',
    translation: 'Translation',
    actions: 'Delete',
  }

  AbacusLib.createWebComponent('dictionary', html, {
    styleFilesURLs: [
      'web-components/views/dictionary/dictionary.css',
      'css/button.css',
    ],

    renderArgs: {
      t: translates,
    },

    onStateChange: function (state, prevState) {
      renderList(this.shadowRoot, state.dictionary, {
        onEdit: Store.editItem.bind(state),
        onDelete: Store.deleteItem.bind(state),
        scrollToBottom: prevState.dictionary.length < state.dictionary.length,
      })
    },
  })
})();