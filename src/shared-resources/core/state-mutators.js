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
    state.folders.push({
      name: 'New folder',
      entries: [],
    })
  },
  deleteFolder(state, index) {
    state.folders.splice(index, 1)
  },

  createNewWord(state, entriesId) {
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

  updateConfig(state, payload) {
    const config = state.config

    for (const payloadKey in payload) {
      config[payloadKey] = payload[payloadKey]
    }
  },

  setRoute(state, route) {
    state.router.path = route
  },
}