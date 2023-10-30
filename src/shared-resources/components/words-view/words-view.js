(() => {
  const classNameHidden = 'hidden'

  const renderField = (index, type, word) => {
    return `<div class="todo-item-field-wrap">
      <span
        class="field ${type}" 
        @onClick="onWordClick" 
      >${word}</span>
      <input 
        class="todo-item-input ${classNameHidden}" 
        type="text" 
        value="${word}"
        data-index="${index}"
        data-field-key="${type}"
        @onChange="onInputChange"
        @onFocus="onInputFocus"
        @onBlur="onEditSuccess"
        @onKeyDown="onInputKeyDown"
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
          <button is="pll-button" data-variant="delete" data-index="${i}" @onClick="deleteWord">
            <img src="/shared-resources/components/words-view/delete.svg" alt="Delete">
          </button>
        </div>
       </li>`
    )
  }

  const renderList = (dictionary) => {
    let $out = ''

    for (let i = 0; i < dictionary.length; i++) {
      $out += renderWordsRow(dictionary[i], i)
    }

    return $out
  }

  const html = ({ t, state }) => {
    const { foldersEntries, currentFolderId } = state
    const dictionary = foldersEntries[currentFolderId]
    const $list = dictionary
      ? renderList(dictionary)
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
          <button is="pll-button" data-variant="back" id="btn-exit-folder" @onClick="exitFolder">
            <img src="/shared-resources/components/words-view/exit-folder.svg" alt="Exit current folder">
            ${t.exitFolder}
          </button>
          <button is="pll-button" data-variant="add" id="btn-add-word" @onClick="createNewWord">
            <img src="/shared-resources/components/words-view/add-word.svg" alt="Add new word to Learn!">
            ${t.openAddWordForm}
          </button>
        </div>
    `
  }

  const translatesEN = {
    original: 'Original',
    translation: 'Translation',
    actions: 'Actions',
    emptyPlaceholder: 'No words yet. Add some!',
    exitFolder: 'Exit folder',
    openAddWordForm: 'Add new word!',
    confirmDeleteMsg: 'Are you sure you want to delete this item?',
  }

  const translatesUK = {
    original: 'Оригінал',
    translation: 'Переклад',
    actions: 'Дії',
    emptyPlaceholder: 'Ще немає слів. Додайте!',
    exitFolder: 'Вийти з папки',
    openAddWordForm: 'Додати нове слово!',
    confirmDeleteMsg: 'Ви впевнені, що хочете видалити цей елемент?',
  }

  const translatesZH = {
    folderName: '文件夹名称',
    original: '原文',
    translation: '翻译',
    actions: '操作',
    emptyPlaceholder: '还没有单词。添加一些！',
    exitFolder: '退出文件夹',
    openAddWordForm: '添加新单词！',
    confirmDeleteMsg: '您确定要删除此项吗？',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  const prevFoldersEntriesLength = {}
  AbacusLib.createWebComponent('words-view', {
    translates,

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

      escapeHandler(ctx, event, $word, $input) {
        if (event.key === 'Escape') {
          event.preventDefault()
          ctx.methods.showLabel($word, $input)
          document.removeEventListener('keydown', ctx.methods.escapeHandler)
        }
      },

      onWordClick(ctx, event) {
        const $word = event.currentTarget
        const $input = $word.nextElementSibling

        ctx.methods.showInput($word, $input)

        document.addEventListener('keydown', () => {
          ctx.methods.escapeHandler(event, ctx, $word, $input)
        })
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
            [$input.dataset['field-key']]: newValue,
          }

          if ($input.dataset['type'] === 'folder') {
            this.stateMutators.editFolder($input.dataset.index, statePayload)
          } else {
            this.stateMutators.editWord($input.dataset.index, statePayload)
          }
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
          const $list = this.$root.querySelector('#body')
          $list.scroll({
            top: $list.scrollHeight,
            behavior: 'smooth',
          })
        }
      }
    ],
  })
})()