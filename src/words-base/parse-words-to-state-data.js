import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { URL } from 'url'

import Translator from '../shared-resources/plugins/translator.js'


const FORMAT_IN = '.txt'
const FORMAT_OUT = '.json'
const LANG = {
  en: 'en',
  zh: 'zh',
  uk: 'uk',
}
const LANGS = Object.values(LANG)

const __dirname = new URL('.', import.meta.url).pathname
const inDirPath = path.join(__dirname, './raw')
const outDirPath = path.join(__dirname, './jsons')

const getLangsTo = (langFrom) => {
  const langsTo = LANGS.filter((lang) => lang !== langFrom)
  return langsTo
}

const parseText = (text, langFrom, langTo) => {
  const translator = new Translator(fetch, langFrom, langTo)

  const parseExecutor = (resolve, reject) => {
    const promises = []

    for (let word of text.split('\n')) {
      word = word.trim().replace('• ', '').replaceAll('\t', '')

      if (!word) {
        continue
      }

      const translateExecutor = (resolve, reject) => {
        setTimeout(() => {

          translator
            .getTranslation(word)
            .then((translation) => {
              resolve({
                original: translation,
                translation: word,
              })
            })
            .catch(reject)

        }, 100)
      }

      const promise = new Promise(translateExecutor)
      promises.push(promise)
    }

    Promise.all(promises).then(resolve).catch(reject)
  }

  return new Promise(parseExecutor)
}

const convertFile = async (filePath, langFrom, langTo) => {
  // Read the contents of the file
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, text) => {
      if (err) {
        console.error('Error reading file:', err)
        return
      }

      // Log the contents of the file
      parseText(text, langFrom, langTo).then(resolve).catch(reject)
    })
  })
}

async function walkAndConvertFiles(currentPath, relativePath, langFrom) {
  if (!fs.existsSync(currentPath)) {
    return
  }

  const files = fs.readdirSync(currentPath)

  for (const file of files) {
    const filePath = path.join(currentPath, file)
    const isDirectory = fs.statSync(filePath).isDirectory()

    if (isDirectory) {
      const newRelativePath = path.join(relativePath, file)
      const newJsonFolderPath = path.join(outDirPath, newRelativePath)
      fs.mkdirSync(newJsonFolderPath, { recursive: true })
      await walkAndConvertFiles(filePath, newRelativePath, langFrom)
    } else if (file.endsWith(FORMAT_IN)) {
      const langsTo = getLangsTo(langFrom)

      for (const langTo of langsTo) {
        const newJsonFolderPath = path.join(outDirPath, relativePath, langTo)
        fs.mkdirSync(newJsonFolderPath, { recursive: true })

        const jsonPath = path.join(outDirPath, relativePath, langTo, file.replace(FORMAT_IN, FORMAT_OUT))
        if (fs.existsSync(jsonPath)) {
          console.log('SKIP', file)
          continue
        }

        const folderEntries = await convertFile(filePath, langFrom, langTo)
        const json = JSON.stringify(folderEntries, null, 2)

        console.log('CREATE', file)
        fs.writeFileSync(jsonPath, json)
      }
    }
  }
}

const generateFoldersJson = (lang) => {
  const inFilesPath = path.join(inDirPath, lang)
  if (!fs.existsSync(inFilesPath)) {
    return
  }

  const jsonPath = path.join(outDirPath, lang, '__folders.json')
  if (fs.existsSync(jsonPath)) {
    console.log('SKIP folders.json for ' + lang)
    return
  }

  const folderIds = fs.readdirSync(inFilesPath)

  const folders = folderIds.map((folderId) => {
    const id = folderId.replace(FORMAT_IN, '')
    return {
      id,
      name: id,
      entriesId: id,
    }
  })

  const json = JSON.stringify(folders, null, 2)
  fs.writeFileSync(jsonPath, json)
}

const generateFolderEntriesJson = (langFrom) => {
  const langsTo = getLangsTo(langFrom)

  for (const langTo of langsTo) {
    const toLangDir = path.join(outDirPath, langFrom, langTo)
    if (!fs.existsSync(toLangDir)) {
      return
    }

    const jsonPath = path.join(toLangDir, '__folder-entries.json')
    if (fs.existsSync(jsonPath)) {
      console.log('SKIP folder-entries.json for ' + langTo)
      return
    }

    const folderEntriesFiles = fs.readdirSync(toLangDir)

    const folderEntries = folderEntriesFiles.reduce((acc, filePath) => {
      const folderEntries = JSON.parse(fs.readFileSync(path.join(toLangDir, filePath), 'utf8'))

      const id = filePath.replace(FORMAT_OUT, '')
      acc[id] = folderEntries

      return acc
    }, {})

    const json = JSON.stringify(folderEntries, null, 2)
    fs.writeFileSync(jsonPath, json)
  }
}

const main = async () => {
  for (const lang of LANGS) {
    generateFoldersJson(lang)

    const inFilesPath = path.join(inDirPath, lang)
    await walkAndConvertFiles(inFilesPath, lang, lang)

    generateFolderEntriesJson(lang)
  }
}

main()