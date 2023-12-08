(() => {
  function getCurrentDate() {
    const currentDate = new Date()

    // Extract day, month, and year components
    const day = String(currentDate.getDate()).padStart(2, '0')
    const month = String(currentDate.getMonth() + 1).padStart(2, '0') // Months are zero-based
    const year = currentDate.getFullYear()

    // Concatenate components in DD/MM/YYYY format
    const formattedDate = `${day}/${month}/${year}`

    return formattedDate
  }

  const html = ({ t }) => {
    return (
      `<button is="pll-button" data-color="add" data-listen-on-Click="import">
          <img src="/extension/app/components/import-export/import.svg" alt="Import">
          ${t.import}
        </button>
        <button is="pll-button" data-color="back" data-listen-on-Click="export">
          <img src="/extension/app/components/import-export/export.svg" alt="Export">
          ${t.export}
        </button>
        <input id="fileInput" type="file" style="position: absolute; visibility: hidden">`
    )
  }

  const translatesEN = {
    import: 'Import all data',
    export: 'Export all data',
  }

  const translatesUK = {
    import: 'Додати всі дані з файлу',
    export: 'Завантажити всі дані',
  }

  const translatesZH = {
    import: '导入所有数据',
    export: '导出所有数据',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  const fileMaxSize = 1024 * 1024 * 10 // 10 MB

  class Component extends AbacusLib.Component {
    translates = translates
    html = html
    styleFilesURLs = [
      'default',
    ]
    methods = {
      export() {
        const jsonData = {
          folders: this.state.folders,
          foldersEntries: this.state.foldersEntries,
        }

        // Convert JSON to string
        const jsonString = JSON.stringify(jsonData, null, 2) // The third parameter (2) is for indentation

        // Create a Blob containing the JSON data
        const blob = new Blob([jsonString], { type: 'application/json' })

        // Create a download link
        const a = document.createElement('a')
        a.href = window.URL.createObjectURL(blob)
        const currentDate = getCurrentDate()
        a.download = `PLL-state-${currentDate}.json`
        a.textContent = 'Download JSON'

        // Append the link to the document
        this.$root.appendChild(a)

        // Trigger a click event on the link
        a.click()

        // Remove the link from the document
        this.$root.removeChild(a)
      },
      import() {
        const fileElement = document.createElement('input')
        fileElement.type = 'file'

        const handleChange = ({ target }) => {
          const files = target.files

          if (files && files.length) {
            if (files[0].size > fileMaxSize) {
              alert('File is too big. Please select a file smaller than 10 MB.')
            } else {
              const file = files[0]
              const reader = new FileReader()

              reader.addEventListener('load', (e) => {
                  try {
                    const jsonString = e.target.result
                    const jsonData = JSON.parse(jsonString)

                    // Use the jsonData object as needed
                    this.stateMutators.import(jsonData)
                    window.close();
                  } catch (error) {
                    console.error('Error parsing JSON:', error)
                  }

                  // reset value to be able to trigger a change event again
                  // after the same file is re-selected
                  fileElement.value = ''
                })
              reader.readAsText(file)
            }
          }
        }
        // @ts-ignore
        fileElement.addEventListener('change', handleChange)
        Reflect.set(fileElement, 'current', fileElement)

        // reset value each time before picking file anew
        // to be able to retrieve an input change event
        Reflect.set(fileElement, 'value', '')
        fileElement?.click()
      },
    }
  }
  AbacusLib.defineCustomElement('import-export', Component)
})()