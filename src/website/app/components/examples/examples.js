(() => {
  const html = ({ t, state }) => {
    const learnLang = state.config.toLang
    const examples = examplesByLocale[learnLang]

    const $examples = examplesOrder.map((exampleNumber) => {
      const videoAttrValue = examples['video' + exampleNumber]
      const videoExample = videoAttrValue ? `video-example="${videoAttrValue}"` : ''
      return (
        `<pll-example
          class="example"
          title="${t['title' + exampleNumber]}"
          subtitle="${t['subtitle' + exampleNumber]}"
          text-example="${examples['body' + exampleNumber]}"
          ${videoExample}
        ></pll-example>`
      )
    })

    return (
      `<div class="examples">
        <pll-languages-view></pll-languages-view>
        ${$examples.join('')}
      </div>`
    )
  }


  const examplesOrder = ['1', '4', '2', '3']

  const translatesUK = {
    title1: 'Вчіть іноземну мову, читаючи новини',
    subtitle1: 'Відстежуйте ваш словниковий список та додавайте нові слова до нього',

    title2: 'Замінюйте неприємні/табу слова',
    subtitle2: 'Замінюйте слова, які вам не подобаються, на ті, які вам подобаються.<br>Наприклад, замініть слово &quot;Meditation&quot; на &quot;Mediation&quot;.',

    title3: 'Веселощі!',
    subtitle3: 'Приправте свій онлайн-досвід: перетворення слів веселощів',

    title4: 'Вчіть синоніми',
    subtitle4: 'Розширте вашу мовну різноманітність: Вчіть синоніми!',
  }

  const translatesEN = {
    title1: 'Learn a foreign language by reading the news',
    subtitle1: 'Keep track of your dictionary list and add new words to it',

    title2: 'Replace annoying/taboo words',
    subtitle2: 'Replace words that you don&apos;t like with ones that you do.<br>For example, replace the word &quot;Meditation&quot; with &quot;Mediation&quot;.',

    title3: 'Fun!',
    subtitle3: 'Spice up your online experience: Transforming website words into fun-filled delights',

    title4: 'Learn synonyms',
    subtitle4: 'Expand your linguistic diversity: Learn synonyms!',
  }

  const translatesZH = {
    title1: '通过阅读新闻来学习外语',
    subtitle1: '跟踪您的字典列表并向其添加新单词',

    title2: '替换令人讨厌/禁忌的单词',
    subtitle2: '用您喜欢的单词替换您不喜欢的单词。<br>例如，将单词“冥想”替换为“调解”。',

    title3: '有趣！',
    subtitle3: '调味您的在线体验：将网站单词转换为充满乐趣的乐趣',

    title4: '学习同义词',
    subtitle4: '扩展您的语言多样性：学习同义词！',
  }

  const translates = {
    en: translatesEN,
    uk: translatesUK,
    zh: translatesZH,
  }

  const examplesUK = {
    body1: '– Як я можу допомогти тобі?<br>',
    video1: '/website/app/assets/video/subtitles-example.uk.vtt',
    body2: '– Росія атакувала Львів дронами-камікадзе, є влучання <br>',
    body3: '– Наш фінансовий аналітик спрогнозував, що наступного року дохід компанії зросте на 15%.<br>',
    body4: '– Привіт, Дмитре! Як твої справи?<br>',
  }

  const examplesEN = {
    body1: '– Computers have revolutionized the ways we lead our everyday lives… <br>',
    video1: '/website/app/assets/video/subtitles-example.en.vtt',
    body2: '– omg ion mb tmrow... i gtg 2 wrk. ttyl!',
    body3: '– Our corporate meeting was a long and tedious affair…',
    body4: '– Hi, Dmitry! How are you doing?<br>',
  }

  const examplesZH = {
    body1: '– Computers have revolutionized the ways we lead our everyday lives… <br>',
    video1: '/website/app/assets/video/subtitles-example.zh.vtt',
    body2: '– omg ion mb tmrow... i gtg 2 wrk. ttyl!',
    body3: '– Our corporate meeting was a long and tedious affair…',
    body4: '– Hi, Dmitry! How are you doing?<br>',
  }

  const examplesByLocale = {
    en: examplesEN,
    uk: examplesUK,
    'zh': examplesZH,
  }

  class Component extends AbacusLib.Component {
    dontUseShadowDOM = true
    translates = translates
    html = html
    css = `
    .examples {
          display: grid;
          justify-content: center;
          justify-items: center;
          grid-row-gap: 32px;
          grid-template-columns: 1fr;
      
          padding: 50px 16px;
      }
      
      
      @media screen and (max-width: 768px) {
          .examples {
              padding: 16px 8px;
          }
      }
    `
  }
  AbacusLib.defineCustomElement('examples', Component)
})()