(() => {
  const formDataToJSON = (formData) => JSON.stringify(Object.fromEntries(formData));

  const main = async () => {
    const $form = document.getElementById('screen-setup')

    $form.addEventListener('submit', (event) => {
      event.preventDefault()

      const json = formDataToJSON(new FormData(event.currentTarget));
      Store.updateConfig(json)
    })
  }

  window.addEventListener('DOMContentLoaded', main)
})()