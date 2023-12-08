(() => {
  const html = ({t}) => `
    <div class="outro">
        <div class="title">
            <h1>${t.title}!</h1>
            <p>${t.subtitle}</p>
        </div>

        <div class="content">
            <p>${t.experience}:</p>
            <ol>
                <li>${t.action1}</li>
                <li>${t.action2}</li>
            </ol>
        </div>

        <div class="actions">
            <pll-install-chrome></pll-install-chrome>
        </div>
    </div>
  `


  const translatesUK = {
    title: 'Вчіться пасивно, під час перегляду веб-сторінок',
    subtitle: 'Це схоже на те, що ви встановили на свій пристрій нову мову, яку ви вивчаєте, але тільки наполовину',

    experience: 'Відчуйте гладкий перехід до мови, виконуючи наступні дії',

    action1: 'Налаштуйте свій словниковий список',
    action2: 'Насолоджуйтесь навчанням, коли слова зі словника замінюють оригінальні слова на всіх веб-сайтах',
  }

  const translatesEN = {
    title: 'Learn passively while browsing the web',
    subtitle: 'It\'s like setting your device to the new language you\'re learning, but only halfway through',

    experience: 'Experience a smooth transition to a language by',

    action1: 'Setting up your dictionary list',
    action2: 'Enjoy learning as dictionary words replace the original ones on all websites',
  }

  const translatesZH = {
    title: '在瀏覽網頁時被動學習',
    subtitle: '就像你把你的設備設置為你正在學習的新語言，但只有一半',

    experience: '通過以下方式體驗平滑過渡到語言',

    action1: '設置您的字典列表',
    action2: '享受學習，因為字典單詞將在所有網站上替換原始單詞',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  class Component extends AbacusLib.Component {
    html = html
    dontUseShadowDOM = true
    translates = translates
    styleFilesURLs = [
      'default',
    ]
  }

  AbacusLib.defineCustomElement('outro', Component)
})()