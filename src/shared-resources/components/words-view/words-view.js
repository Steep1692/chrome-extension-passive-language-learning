(() => {
  const classNameHidden = 'hidden'

  const renderField = (index, type, word) => {
    return `<div class="todo-item-field-wrap">
      <span
        class="field ${type}" 
        data-listen-on-Click="onWordClick" 
      >${word}</span>
      <input 
        class="todo-item-input ${classNameHidden}" 
        type="text" 
        value="${word}"
        data-index="${index}"
        data-field-key="${type}"
        data-listen-on-Change="onInputChange"
        data-listen-on-Focus="onInputFocus"
        data-listen-on-Blur="onEditSuccess"
        data-listen-on-KeyDown="onInputKeyDown"
      >
    </div>`
  }

  const renderWordsRow = (item, i) => {
    const odd = i % 2 !== 0

    let $fields = ''

    $fields += renderField(i, 'original', item.original)
    $fields += renderField(i, 'translation', item.translation)

    return (
      `<li class="todo-item ${odd ? 'odd' : ''}">
         <div class="todo-item-inner">
           ${$fields}
          <button is="pll-button" data-variant="circle" data-color="delete" data-index="${i}" data-listen-on-Click="deleteWord">
            <img src="/shared-resources/components/words-view/delete.svg" alt="Delete">
          </button>
        </div>
       </li>`
    )
  }

  const renderList = (dictionary) => {
    let $out = ''

    dictionary.forEach((item, i) => {
      $out += renderWordsRow(item, i)
    })

    return $out
  }

  const filterDictionary = (dictionary, search) => {
    if (!search) {
      return dictionary
    }
    
    const searchLowerCased = search.toLowerCase()
    
    return dictionary.filter(({ original, translation }) => {
      return original.toLowerCase().includes(searchLowerCased)
        || translation.toLowerCase().includes(searchLowerCased)
    })
  }
  
  const html = ({ t, state, search }) => {
    const { foldersEntries, currentFolderId } = state
    const dictionary = foldersEntries[currentFolderId]
    const $list = dictionary
      ? renderList(filterDictionary(dictionary, search))
      : `<br/><pll-typography variant="subtitle" text="${t.emptyPlaceholder}"></pll-typography>`

    return `
        <div id="head">
            <div>#</div>
            <div>${t.original}</div>
            <div>${t.translation}</div>
            <div>${t.actions}</div>
        </div>
        <ol id="body">
          ${$list}
        </ol>
        <div id="entries-actions">
          <button is="pll-button" data-color="back" id="btn-exit-folder" data-listen-on-Click="exitFolder">
            <img src="/shared-resources/components/words-view/exit-folder.svg" alt="Exit current folder">
            ${t.exitFolder}
          </button>
          <button is="pll-button" data-color="add" id="btn-add-word" data-listen-on-Click="createNewWord">
            <img src="/shared-resources/components/words-view/add-word.svg" alt="Add new word to Learn!">
            ${t.openAddWordForm}
          </button>
        </div>
    `
  }

  const prevFoldersEntriesLength = {}
  AbacusLib.createWebComponent('words-view', {
    hasTranslates: true,

    html,
    styleFilesURLs: [
      'default',
    ],

    methods: {
      createNewWord(ctx) {
        ctx.stateMutators.createNewWord(ctx.state.currentFolderId)
      },
      exitFolder(ctx) {
        ctx.stateMutators.setCurrentFolderId(null)
      },

      showInput($word, $input) {
        $word.classList.add(classNameHidden)
        $input.classList.remove(classNameHidden)
        $input.focus()
      },
      showLabel($word, $input) {
        $input.classList.add(classNameHidden)
        $word.classList.remove(classNameHidden)
      },

      escapeHandler(event) {
        if (event.key === 'Escape') {
          event.preventDefault()
          const $input = this.$root.querySelector(`.todo-item-input:not(.${classNameHidden}})`)
          const $word = $input.previousElementSibling
          this.methods.showLabel($word, $input)
          document.removeEventListener('keydown', this.methods.escapeHandler)
        }
      },

      onWordClick(ctx, event) {
        const $word = event.currentTarget
        const $input = $word.nextElementSibling

        ctx.methods.showInput($word, $input)

        document.addEventListener('keydown', ctx.methods.escapeHandler)
      },

      onEditSuccess(ctx, event) {
        const $input = event.currentTarget
        const $word = $input.previousElementSibling

        document.removeEventListener('keydown', ctx.methods.escapeHandler)

        ctx.methods.showLabel($word, $input)

        if ($input.hasChanged) {
          const newValue = $input.value
          $word.textContent = newValue

          const statePayload = {
            [$input.dataset.fieldKey]: newValue,
          }

          this.stateMutators.editWord(ctx.state.currentFolderId, $input.dataset.index, statePayload)
        }
      },

      onInputKeyDown(ctx, event) {
        if (event.key === 'Enter') {
          ctx.methods.onEditSuccess(ctx, event)
        }
      },
      onInputChange(ctx, event) {
        event.currentTarget.hasChanged = true
      },
      onInputFocus(ctx, event) {
        event.currentTarget.hasChanged = false
      },

      deleteWord(ctx, event) {
        const t = translates[this.state.config.lang]
        const i = event.currentTarget.dataset.index

        if (confirm(t.confirmDeleteMsg)) {
          const currentFolderId = ctx.state.currentFolderId
          this.stateMutators.deleteWord(currentFolderId, i)
        }
      },
    },

    stateEffects: [
      function scrollBottomWhenItemAdded () {
        const foldersEntries = this.state.foldersEntries
        const currentFolderId = this.state.currentFolderId

        const entriesLength = foldersEntries[currentFolderId]?.length ?? 0

        const scroll = entriesLength > prevFoldersEntriesLength[currentFolderId]
        prevFoldersEntriesLength[currentFolderId] = entriesLength

        if (scroll) {
          setTimeout(() => {
            const $list = this.$root.querySelector('#body')
            $list.scroll({
              top: $list.scrollHeight,
              behavior: 'smooth',
            })
          })
        }
      }
    ],
  })
})()