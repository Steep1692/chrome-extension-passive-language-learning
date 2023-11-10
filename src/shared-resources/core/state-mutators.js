const StateMutators = {
  setProfile(state, profile) {
    state.profile = profile
  },

  setCurrentFolderId(state, entriesId) {
    state.currentFolderId = entriesId
  },

  editFolder(state, index, payload) {
    const folder = state.folders[index]

    for (const payloadKey in payload) {
      folder[payloadKey] = payload[payloadKey]
    }
  },

  createNewFolder(state) {
    const id = Date.now()
    state.folders.push({
      id,
      name: 'New folder',
      entriesId: id,
    })
  },
  deleteFolder(state, index) {
    const entriesId = state.folders[index]?.entriesId
    state.folders.splice(index, 1)

    // Remove entries
    if (entriesId in state.foldersEntries) {
      state.foldersEntries[entriesId] = undefined
    }
  },

  createNewWord(state, entriesId) {
    if (!state.foldersEntries[entriesId]) {
      state.foldersEntries[entriesId] = []
    }

    state.foldersEntries[entriesId].push({
      id: Date.now(),
      original: '',
      translation: '',
    })
  },
  editWord(state, entriesId, index, payload) {
    const item = state.foldersEntries[entriesId][index]

    for (const payloadKey in payload) {
      item[payloadKey] = payload[payloadKey]
    }
  },
  deleteWord(state, entriesId, index) {
    state.foldersEntries[entriesId].splice(index, 1)
  },

  disableForWebsite(state, website) {
    state.config.ignoredOrigins.push(website)
  },

  enableForWebsite(state, website) {
    const index = state.config.ignoredOrigins.indexOf(website)
    if (index !== -1) {
      state.config.ignoredOrigins.splice(index, 1)
    }
  },

  disableAtAll(state) {
    state.config.disabledAtAll = true
  },

  enableAtAll(state) {
    state.config.disabledAtAll = false
  },

  updateConfig(state, payload) {
    const config = state.config

    for (const payloadKey in payload) {
      config[payloadKey] = payload[payloadKey]
    }
  },

  setRoute(state, route) {
    state.router.path = route
  },

  import(state, newState) {
    for (const newStateKey in newState) {
      state[newStateKey] = newState[newStateKey]
    }
  }
}