(() => {
  const convertFormDataToJSON = (formData) => JSON.stringify(Object.fromEntries(formData))

  const html = ({ t }) => `
      <form id="form" class="form" style="display: none">
        <h2>${t.title}</h2>
        <p>${t.subtitle}:</p>

        <fieldset class="setup-screen-learn-lang-row">
            <label class="setup-screen-item">
                <img src="images/en.png" alt="English flag">
                <span>${t.en}</span>
                <input name="toLang" value="en" type="radio" required checked>
            </label>
            <label class="setup-screen-item">
                <img src="images/zh.png" alt="Chinese flag">
                <span>${t.zh}</span>
                <input name="toLang" value="zh" type="radio">
            </label>
        </fieldset>

        <button class="button-submit" type="submit">
            ${t.startLearning}
            &nbsp;
            <span class="emoji-wrap">
                <span class="emoji-valid">🐻</span>
                <span class="emoji-active">👍</span>
            </span>
        </button>
    </form>`

  AbacusLib.createWebComponent('setup-screen', html, {
    styleFilesURLs: [
      'app/views/setup-screen/setup-screen.css',
    ],
    defineElements: function () {
      return {
        $form: this.shadowRoot.getElementById('form'),
      }
    },
    renderArgs: () => ({
      t: {
        title: 'Setup screen',
        subtitle: 'Choose language to learn',
        en: 'English',
        zh: 'Chinese',
        startLearning: 'Start learning',
      }
    }),
    onAfterFirstRender: function () {
      const { $form } = this.elements

      $form.addEventListener('submit', (event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const json = convertFormDataToJSON(formData)

        this.store.updateConfig(json)
      })
    }
  })
})();