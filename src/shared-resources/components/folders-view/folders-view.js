(() => {
  const classNameHidden = 'hidden'

  const renderFolder = (index, type, { name, entriesId }) => {
    return `<button class="todo-item-field-wrap folder" @onClick="onFolderClick" data-entries-id="${entriesId}">
      <span class="${type}">
        <img src="/shared-resources/components/folders-view/folder.svg" alt="Folder">
        ${name}
      </span>
      <input 
        class="todo-item-input ${classNameHidden}" 
        type="text" 
        value="${name}"
        data-index="${index}"
        data-field-key="name"
        data-type="folder"
        @onChange="onInputChange"
        @onFocus="onInputFocus"
        @onBlur="onEditSuccess"
        @onKeyDown="onInputKeyDown"
      >
    </button>`
  }

  const renderFolderRow = (item, i) => {
    const odd = i % 2 !== 0

    return (
      `<li class="todo-item ${odd ? 'odd' : ''}">
         <div class="todo-item-inner folder">
           ${renderFolder(i, 'folder', item)}
           <button is="pll-button" data-variant="edit" data-index="${i}" @onClick="onClickEditFolder">
            <img src="/shared-resources/components/folders-view/edit.svg" alt="Edit folder name">
          </button>
          <button is="pll-button" data-variant="delete" data-index="${i}" @onClick="deleteFolder">
            <img src="/shared-resources/components/folders-view/delete.svg" alt="Delete folder">
          </button>
        </div>
       </li>`
    )
  }

  const renderFolderList = (folders) => {
    let $out = ''

    for (let i = 0; i < folders.length; i++) {
      $out += renderFolderRow(folders[i], i)
    }

    return $out
  }


  const html = ({ t, state, classnames }) => {
    const { folders, currentFolderId } = state
    const $list = renderFolderList(folders)

    return `
        <div id="head" class="${classnames({ 'folder-list': !currentFolderId, })}">
            <div>#</div>
            <div>${t.folderName}</div>
            <div>${t.actions}</div>
        </div>
        <ol id="body">
          ${$list}
        </ol>
        <button id="btn-add-folder" is="pll-button" data-variant="add" @onClick="createNewFolder">
          <img src="/shared-resources/components/folders-view/add-folder.svg" alt="Add folder">
          ${t.createNewFolder}
        </button>
    `
  }

  const translatesEN = {
    folderName: 'Folder name',
    actions: 'Actions',
    createNewFolder: 'Create new folder',
    confirmDeleteFolderMsg: 'Are you sure you want to delete this folder?',
  }

  const translatesUK = {
    folderName: 'Назва папки',
    actions: 'Дії',
    createNewFolder: 'Створити нову папку',
    confirmDeleteFolderMsg: 'Ви впевнені, що хочете видалити цю папку?',
  }

  const translatesZH = {
    folderName: '文件夹名称',
    actions: '操作',
    createNewFolder: '创建新文件夹',
    confirmDeleteFolderMsg: '您确定要删除此文件夹吗？',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  let prevFoldersLength = 0
  const prevFoldersEntriesLength = {}
  AbacusLib.createWebComponent('folders-view', {
    translates,

    html,
    styleFilesURLs: [
      'default',
    ],

    methods: {
      onFolderClick(ctx, event) {
        const entriesId = event.currentTarget.getAttribute('data-entries-id')
        ctx.stateMutators.setCurrentFolderId(entriesId)
      },
      onClickEditFolder(ctx, event) {
        const $word = event.currentTarget.parentNode.querySelector('span')
        const $input = event.currentTarget.parentNode.querySelector('input')

        ctx.methods.showInput($word, $input)

        document.addEventListener('keydown', (event) => {
          ctx.methods.escapeHandler(ctx, event, $word, $input)
        })
      },
      createNewFolder(ctx) {
        ctx.stateMutators.createNewFolder()
      },
      deleteFolder(ctx, event) {
        const index = event.currentTarget.getAttribute('data-index')

        const t = translates[this.state.config.lang]
        confirm(t.confirmDeleteFolderMsg) && ctx.stateMutators.deleteFolder(index)
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
    },

    stateEffects: [
      function scrollBottomWhenItemAdded () {
        const folders = this.state.folders

        const scroll = folders.length > prevFoldersLength
        prevFoldersLength =  folders.length

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