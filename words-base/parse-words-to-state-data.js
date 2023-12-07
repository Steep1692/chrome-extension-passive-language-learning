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

const UK_FOLDER_ID_TO_NAME = {
  "100-adverbs": "100 Прислівників",
  "100-conjunction-words": "100 Сполучників",
  "100-interjection-words": "100 Міжслів",
  "100-nouns": "100 Іменників",
  "100-preposition-words": "100 Прийменників",
  "100-verbs": "100 Дієслів",
  "countable": "Зліченні",
  "linking-verbs": "Зв'язуючі дієслова",
  "object-pronouns": "Займенники-об'єкти",
  "personal-pronouns": "Особисті займенники",
  "possesive-pronouns": "Присвійні займенники",
  "possesive-words": "Присвійні слова",
  "question-complex-words": "Складні питальні слова",
  "question-words": "Питальні слова",
  "reflexive-pronouns": "Займенники-вказівники",
  "uncountable": "Незліченні"
}

const folderIdToName = (folderId, langTo) => {
  if (langTo === LANG.uk) {
    return UK_FOLDER_ID_TO_NAME[folderId]
  }

  return folderId
}

const getLangsTo = (langFrom) => {
  const langsTo = LANGS.filter((lang) => lang !== langFrom)
  return langsTo
}

const parseText = (text, langFrom, langTo) => {
  const translator = new Translator(langFrom, langTo, fetch)

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

const generateFoldersJson = (langFrom) => {
  const langsTo = getLangsTo(langFrom)

  for (const langTo of langsTo) {
    const inFilesPath = path.join(inDirPath, langFrom)
    if (!fs.existsSync(inFilesPath)) {
      return
    }

    const outPath = path.join(outDirPath, langFrom, langTo)

    if (!fs.existsSync(outPath)) {
      fs.mkdirSync(outPath, { recursive: true })
    }

    const jsonPath = path.join(outPath, '__folders.json')
    if (fs.existsSync(jsonPath)) {
      console.log('SKIP folders.json for ' + langFrom)
      return
    }

    const folderIds = fs.readdirSync(inFilesPath)

    const folders = folderIds.map((folderId) => {
      const id = folderId.replace(FORMAT_IN, '')
      return {
        id,
        name: folderIdToName(id, langTo),
        entriesId: id,
      }
    })

    const json = JSON.stringify(folders, null, 2)
    fs.writeFileSync(jsonPath, json)
  }
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
    const inFilesPath = path.join(inDirPath, lang)
    await walkAndConvertFiles(inFilesPath, lang, lang)

    generateFolderEntriesJson(lang)
    generateFoldersJson(lang)
  }
}

main()