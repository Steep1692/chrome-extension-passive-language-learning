(() => {
  const filterFolders = (folders, search) => {
    if (!search) {
      return folders
    }

    const searchLowerCased = search.toLowerCase()

    return folders.filter(({ name }) => {
      return name.toLowerCase().includes(searchLowerCased)
    })
  }

  const renderFolder = (index, type, { id, name, entriesId }, editId) => {
    const isEditFolder = editId === id

    return `<button class="btn-name" data-listen-on-Click="onFolderClick" data-entries-id="${entriesId}">
        <img src="/shared-resources/components/folders-view/folder.svg" alt="Folder">
        <span class="text">
          ${isEditFolder ? `<input
          class="input"
          type="text"
          value="${name}"
          data-index="${index}"
          data-id="${id}"
          data-listen-on-Change="onInputChange"
          data-listen-on-Focus="onInputFocus"
          data-listen-on-Blur="onEditSuccess"
          data-listen-on-KeyDown="onInputKeyDown"
        >` : name}
        </span>
    </button>`
  }

  const renderFolderRow = (item, i, editId) => {
    const odd = i % 2 !== 0

    return (
      `<li class="todo-item ${odd ? 'odd' : ''}">
         <div class="todo-item-inner folder">
           ${renderFolder(i, 'folder', item, editId)}
           ${
              editId === item.id ? `<button data-key="delete" is="pll-button" data-variant="circle" data-color="cancel" data-id="${item.id}" data-listen-on-Click="cancelEditing">
                  <img src="/shared-resources/components/folders-view/cross.svg" alt="Cancel edit folder name">
                </button>`: `<button data-key="edit" is="pll-button" data-variant="circle" data-color="edit" data-id="${item.id}" data-listen-on-Click="onClickEditFolder">
                    <img src="/shared-resources/components/folders-view/edit.svg" alt="Edit folder name">
                  </button>`
            }
          <button is="pll-button" data-variant="circle" data-color="delete" data-index="${i}" data-listen-on-Click="deleteFolder">
            <img src="/shared-resources/components/folders-view/delete.svg" alt="Delete folder">
          </button>
        </div>
       </li>`
    )
  }

  const renderFolderList = (folders, editId) => {
    let $out = ''

    for (let i = 0; i < folders.length; i++) {
      $out += renderFolderRow(folders[i], i, editId)
    }

    return $out
  }

  const html = ({ t, state, search, localState, classnames }) => {
    const { folders, currentFolderId } = state
    const foldersFiltered = filterFolders(folders, search)
    const $list = renderFolderList(foldersFiltered, localState.editId)

    return (
      `<div id="head" class="${classnames({ 'folder-list': !currentFolderId, })}">
            <div>#</div>
            <div>${t.folderName}</div>
            <div>${t.actions}</div>
        </div>
        <ol id="body">
          ${$list}
        </ol>
        <button id="btn-add-folder" is="pll-button" data-color="add" data-listen-on-Click="createNewFolder">
          <img src="/shared-resources/components/folders-view/add-folder.svg" alt="Add folder">
          ${t.createNewFolder}
        </button>`
    )
  }

  let prevFoldersLength = 0
  class Component extends AbacusLib.Component {
    hasTranslates = true
    html = html
    styleFilesURLs = [
      'default',
    ]
    localState = {
      editId: null,
    }
    methods = {
      onFolderClick(ctx, event) {
        if (ctx.localState.editId) {
          return
        }

        const entriesId = event.currentTarget.getAttribute('data-entries-id')
        ctx.stateMutators.setCurrentFolderId(entriesId)
      },
      enableEditingById(ctx, id) {
        ctx.mutateLocalState({ editId: id })

        requestAnimationFrame(() => {
          const $input = ctx.$root.querySelector(`input[data-id="${id}"]`)
          $input.focus()
          $input.select()
        })

        document.activeElement.blur()
      },
      onClickEditFolder(ctx, event) {
        const id = event.currentTarget.getAttribute('data-id')
        ctx.methods.enableEditingById(ctx, id)
      },
      createNewFolder(ctx) {
        const id = ctx.stateMutators.createNewFolder()

        requestAnimationFrame(() => {
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

          setTimeout(() => {
            ctx.methods.enableEditingById(ctx, id)
          }, 700)
        })
      },
      deleteFolder(ctx, event) {
        const index = event.currentTarget.getAttribute('data-index')

        const t = ctx.translates[this.state.config.lang]
        confirm(t.confirmDeleteFolderMsg) && ctx.stateMutators.deleteFolder(index)
      },

      cancelEditing(ctx) {
        ctx.mutateLocalState({ editId: null })
      },

      onEditSuccess(ctx, event) {
        ctx.methods.cancelEditing(ctx, event)

        const $input = event.currentTarget

        if ($input.hasChanged) {
          const newValue = $input.value

          this.stateMutators.editFolder($input.dataset.index, {
            name: newValue,
          })
        }
      },

      onInputKeyDown(ctx, event) {
        if (event.key === 'Enter') {
          ctx.methods.onEditSuccess(ctx, event)
        } else if (event.key === 'Escape') {
          event.preventDefault()
          ctx.methods.cancelEditing(ctx, event)
        }
      },
      onInputChange(ctx, event) {
        event.currentTarget.hasChanged = true
      },
      onInputFocus(ctx, event) {
        event.currentTarget.hasChanged = false
      },
    }
  }
  AbacusLib.defineCustomElement('folders-view', Component)
})()