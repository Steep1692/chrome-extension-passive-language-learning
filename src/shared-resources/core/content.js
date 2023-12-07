import Translator from '../plugins/translator.js'
import { toast as Toaster } from '../plugins/toast.min.js'

(async () => {
  'use strict'

  class ScriptManager {
    static injectScriptToPage = (src, scriptId) => {
      if (document.getElementById(scriptId)) return Promise.resolve()

      const n = document.createElement('script')
      n.id = scriptId
      document.documentElement.append(n)
      n.src = chrome.runtime.getURL(src)
      n.defer = true
      return new Promise((resolve) => {
        n.onload = resolve
      })
    }
  }

  const FOLDER_ID_SELECTION_WORDS = 'selection-words'

  const FOLDERS_SAMPLE_DATA_EN = [
    {
      "id": "100-adverbs",
      "name": "100 Прислівників",
      "entriesId": "100-adverbs"
    },
    {
      "id": "100-conjunction-words",
      "name": "100 Сполучників",
      "entriesId": "100-conjunction-words"
    },
    {
      "id": "100-interjection-words",
      "name": "100 Міжслів",
      "entriesId": "100-interjection-words"
    },
    {
      "id": "100-nouns",
      "name": "100 Іменників",
      "entriesId": "100-nouns"
    },
    {
      "id": "100-preposition-words",
      "name": "100 Прийменників",
      "entriesId": "100-preposition-words"
    },
    {
      "id": "100-verbs",
      "name": "100 Дієслів",
      "entriesId": "100-verbs"
    },
    {
      "id": "countable",
      "name": "Зліченні",
      "entriesId": "countable"
    },
    {
      "id": "linking-verbs",
      "name": "Зв'язуючі дієслова",
      "entriesId": "linking-verbs"
    },
    {
      "id": "object-pronouns",
      "name": "Займенники-об'єкти",
      "entriesId": "object-pronouns"
    },
    {
      "id": "personal-pronouns",
      "name": "Особисті займенники",
      "entriesId": "personal-pronouns"
    },
    {
      "id": "possesive-pronouns",
      "name": "Присвійні займенники",
      "entriesId": "possesive-pronouns"
    },
    {
      "id": "possesive-words",
      "name": "Присвійні слова",
      "entriesId": "possesive-words"
    },
    {
      "id": "question-complex-words",
      "name": "Складні питальні слова",
      "entriesId": "question-complex-words"
    },
    {
      "id": "question-words",
      "name": "Питальні слова",
      "entriesId": "question-words"
    },
    {
      "id": "reflexive-pronouns",
      "name": "Займенники-вказівники",
      "entriesId": "reflexive-pronouns"
    },
    {
      "id": "uncountable",
      "name": "Незліченні",
      "entriesId": "uncountable"
    }
  ]

  const FOLDER_ENTRIES_SAMPLE_DATA_EN = {
    '100-adverbs': [
      {
        'original': 'Також',
        'translation': 'Also'
      },
      {
        'original': 'Завжди',
        'translation': 'Always'
      },
      {
        'original': 'Де завгодно',
        'translation': 'Anywhere'
      },
      {
        'original': 'геть',
        'translation': 'Away'
      },
      {
        'original': 'Назад',
        'translation': 'Back'
      },
      {
        'original': 'краще',
        'translation': 'Better'
      },
      {
        'original': 'Звичайно',
        'translation': 'Certainly'
      },
      {
        'original': 'Ясно',
        'translation': 'Clearly'
      },
      {
        'original': 'Повністю',
        'translation': 'Completely'
      },
      {
        'original': 'Постійно',
        'translation': 'Constantly'
      },
      {
        'original': 'Безумовно',
        'translation': 'Definitely'
      },
      {
        'original': 'Легко',
        'translation': 'Easily'
      },
      {
        'original': 'В іншому місці',
        'translation': 'Elsewhere'
      },
      {
        'original': 'Достатньо',
        'translation': 'Enough'
      },
      {
        'original': 'Особливо',
        'translation': 'Especially'
      },
      {
        'original': 'Навіть',
        'translation': 'Even'
      },
      {
        'original': 'точно',
        'translation': 'Exactly'
      },
      {
        'original': 'швидко',
        'translation': 'Fast'
      },
      {
        'original': 'Нарешті',
        'translation': 'Finally'
      },
      {
        'original': 'Часто',
        'translation': 'Frequently'
      },
      {
        'original': 'Повністю',
        'translation': 'Fully'
      },
      {
        'original': 'Загалом',
        'translation': 'Generally'
      },
      {
        'original': 'важко',
        'translation': 'Hard'
      },
      {
        'original': 'тут',
        'translation': 'Here'
      },
      {
        'original': 'як',
        'translation': 'How'
      },
      {
        'original': 'Негайно',
        'translation': 'Immediately'
      },
      {
        'original': 'Дійсно',
        'translation': 'Indeed'
      },
      {
        'original': 'Натомість',
        'translation': 'Instead'
      },
      {
        'original': 'Просто',
        'translation': 'Just'
      },
      {
        'original': 'Пізніше',
        'translation': 'Later'
      },
      {
        'original': 'Найменше',
        'translation': 'Least'
      },
      {
        'original': 'менше',
        'translation': 'Less'
      },
      {
        'original': 'Так само',
        'translation': 'Likewise'
      },
      {
        'original': 'Довше',
        'translation': 'Longer'
      },
      {
        'original': 'Тим часом',
        'translation': 'Meanwhile'
      },
      {
        'original': 'більше',
        'translation': 'More'
      },
      {
        'original': 'більшість',
        'translation': 'Most'
      },
      {
        'original': 'багато',
        'translation': 'Much'
      },
      {
        'original': 'майже',
        'translation': 'Nearly'
      },
      {
        'original': 'Ніколи',
        'translation': 'Never'
      },
      {
        'original': 'Далі',
        'translation': 'Next'
      },
      {
        'original': 'Зараз',
        'translation': 'Now'
      },
      {
        'original': 'часто',
        'translation': 'Often'
      },
      {
        'original': 'Тільки',
        'translation': 'Only'
      },
      {
        'original': 'Можливо',
        'translation': 'Perhaps'
      },
      {
        'original': 'Рідко',
        'translation': 'Rarely'
      },
      {
        'original': 'Дійсно',
        'translation': 'Really'
      },
      {
        'original': 'Нещодавно',
        'translation': 'Recently'
      },
      {
        'original': 'правильно',
        'translation': 'Right'
      },
      {
        'original': 'Рідко',
        'translation': 'Seldom'
      },
      {
        'original': 'Серйозно',
        'translation': 'Seriously'
      },
      {
        'original': 'просто',
        'translation': 'Simply'
      },
      {
        'original': 'повільно',
        'translation': 'Slowly'
      },
      {
        'original': 'Так',
        'translation': 'So'
      },
      {
        'original': 'іноді',
        'translation': 'Sometimes'
      },
      {
        'original': 'скоро',
        'translation': 'Soon'
      },
      {
        'original': 'Конкретно',
        'translation': 'Specifically'
      },
      {
        'original': 'досі',
        'translation': 'Still'
      },
      {
        'original': 'Звичайно',
        'translation': 'Surely'
      },
      {
        'original': 'Потім',
        'translation': 'Then'
      },
      {
        'original': 'там',
        'translation': 'There'
      },
      {
        'original': 'тому',
        'translation': 'Therefore'
      },
      {
        'original': 'Сьогодні',
        'translation': 'Today'
      },
      {
        'original': 'завтра',
        'translation': 'Tomorrow'
      },
      {
        'original': 'теж',
        'translation': 'Too'
      },
      {
        'original': 'Воістину',
        'translation': 'Truly'
      },
      {
        'original': 'Двічі',
        'translation': 'Twice'
      },
      {
        'original': 'Зазвичай',
        'translation': 'Usually'
      },
      {
        'original': 'дуже',
        'translation': 'Very'
      },
      {
        'original': 'Добре',
        'translation': 'Well'
      },
      {
        'original': 'Коли',
        'translation': 'When'
      },
      {
        'original': 'Де',
        'translation': 'Where'
      },
      {
        'original': 'Поки',
        'translation': 'While'
      },
      {
        'original': 'чому',
        'translation': 'Why'
      },
      {
        'original': 'вчора',
        'translation': 'Yesterday'
      },
      {
        'original': 'ще',
        'translation': 'Yet'
      },
      {
        'original': 'майже',
        'translation': 'Almost'
      },
      {
        'original': 'вже',
        'translation': 'Already'
      },
      {
        'original': 'Завжди',
        'translation': 'Always'
      },
      {
        'original': 'Так чи інакше',
        'translation': 'Anyhow'
      },
      {
        'original': 'Будь-коли',
        'translation': 'Anytime'
      },
      {
        'original': 'Де завгодно',
        'translation': 'Anywhere'
      },
      {
        'original': 'Все одно',
        'translation': 'Anyway'
      },
      {
        'original': 'Назад',
        'translation': 'Back'
      },
      {
        'original': 'В основному',
        'translation': 'Basically'
      },
      {
        'original': 'Ясно',
        'translation': 'Clearly'
      },
      {
        'original': 'Звичайно',
        'translation': 'Certainly'
      },
      {
        'original': 'Безумовно',
        'translation': 'Definitely'
      },
      {
        'original': 'Легко',
        'translation': 'Easily'
      },
      {
        'original': 'В іншому місці',
        'translation': 'Elsewhere'
      },
      {
        'original': 'Нарешті',
        'translation': 'Finally'
      },
      {
        'original': 'Часто',
        'translation': 'Frequently'
      },
      {
        'original': 'Повністю',
        'translation': 'Fully'
      },
      {
        'original': 'Загалом',
        'translation': 'Generally'
      },
      {
        'original': 'тут',
        'translation': 'Here'
      },
      {
        'original': 'як',
        'translation': 'How'
      },
      {
        'original': 'Негайно',
        'translation': 'Immediately'
      },
      {
        'original': 'Натомість',
        'translation': 'Instead'
      },
      {
        'original': 'Просто',
        'translation': 'Just'
      },
      {
        'original': 'Пізніше',
        'translation': 'Later'
      }
    ],
    '100-conjunction-words': [
      {
        'original': 'І',
        'translation': 'And'
      },
      {
        'original': 'Або',
        'translation': 'Or'
      },
      {
        'original': 'але',
        'translation': 'But'
      },
      {
        'original': 'ні',
        'translation': 'Nor'
      },
      {
        'original': 'для',
        'translation': 'For'
      },
      {
        'original': 'ще',
        'translation': 'Yet'
      },
      {
        'original': 'Так',
        'translation': 'So'
      },
      {
        'original': 'Хоча',
        'translation': 'Although'
      },
      {
        'original': 'Оскільки',
        'translation': 'Because'
      },
      {
        'original': 'Оскільки',
        'translation': 'Since'
      },
      {
        'original': 'Хіба що',
        'translation': 'Unless'
      },
      {
        'original': 'Поки',
        'translation': 'While'
      },
      {
        'original': 'Де',
        'translation': 'Where'
      },
      {
        'original': 'Коли',
        'translation': 'When'
      },
      {
        'original': 'Після',
        'translation': 'After'
      },
      {
        'original': 'Раніше',
        'translation': 'Before'
      },
      {
        'original': 'Якщо',
        'translation': 'If'
      },
      {
        'original': 'Хіба що',
        'translation': 'Unless'
      },
      {
        'original': 'Поки',
        'translation': 'Until'
      },
      {
        'original': 'Хоча',
        'translation': 'Though'
      },
      {
        'original': 'Крім того',
        'translation': 'Moreover'
      },
      {
        'original': 'Крім того',
        'translation': 'Furthermore'
      },
      {
        'original': 'Проте',
        'translation': 'However'
      },
      {
        'original': 'Тим не менш',
        'translation': 'Nevertheless'
      },
      {
        'original': 'Тим не менш',
        'translation': 'Nonetheless'
      },
      {
        'original': 'тому',
        'translation': 'Therefore'
      },
      {
        'original': 'Таким чином',
        'translation': 'Thus'
      },
      {
        'original': 'Тим часом',
        'translation': 'Meanwhile'
      },
      {
        'original': 'досі',
        'translation': 'Still'
      },
      {
        'original': 'Отже',
        'translation': 'Hence'
      },
      {
        'original': 'Дійсно',
        'translation': 'Indeed'
      },
      {
        'original': 'І навпаки',
        'translation': 'Conversely'
      },
      {
        'original': 'Інакше',
        'translation': 'Otherwise'
      },
      {
        'original': 'Швидше',
        'translation': 'Rather'
      },
      {
        'original': 'Натомість',
        'translation': 'Instead'
      },
      {
        'original': 'Крім того',
        'translation': 'Besides'
      },
      {
        'original': 'Крім того',
        'translation': 'Moreover'
      },
      {
        'original': 'Крім того',
        'translation': 'Furthermore'
      },
      {
        'original': 'Додатково',
        'translation': 'Additionally'
      },
      {
        'original': 'В додаток',
        'translation': 'In addition'
      },
      {
        'original': 'Насправді',
        'translation': 'In fact'
      },
      {
        'original': 'ще',
        'translation': 'Yet'
      },
      {
        'original': 'Інакше',
        'translation': 'Otherwise'
      },
      {
        'original': 'Натомість',
        'translation': 'Instead'
      },
      {
        'original': 'Крім того',
        'translation': 'Besides'
      },
      {
        'original': 'Тим не менш',
        'translation': 'Nevertheless'
      },
      {
        'original': 'Тим не менш',
        'translation': 'Nonetheless'
      },
      {
        'original': 'І навпаки',
        'translation': 'Conversely'
      },
      {
        'original': 'Крім того',
        'translation': 'Furthermore'
      },
      {
        'original': 'Крім того',
        'translation': 'Moreover'
      },
      {
        'original': 'В додаток',
        'translation': 'In addition'
      },
      {
        'original': 'Насправді',
        'translation': 'In fact'
      },
      {
        'original': 'Отже',
        'translation': 'Consequently'
      },
      {
        'original': 'Згодом',
        'translation': 'Subsequently'
      },
      {
        'original': 'Відповідно',
        'translation': 'Accordingly'
      },
      {
        'original': 'Потім',
        'translation': 'Then'
      },
      {
        'original': 'Далі',
        'translation': 'Next'
      },
      {
        'original': 'Нарешті',
        'translation': 'Finally'
      },
      {
        'original': 'тому',
        'translation': 'Therefore'
      },
      {
        'original': 'Таким чином',
        'translation': 'Thus'
      },
      {
        'original': 'Проте',
        'translation': 'However'
      },
      {
        'original': 'Тим не менш',
        'translation': 'Nevertheless'
      },
      {
        'original': 'Тим не менш',
        'translation': 'Nonetheless'
      },
      {
        'original': 'І навпаки',
        'translation': 'Conversely'
      },
      {
        'original': 'З іншого боку',
        'translation': 'On the other hand'
      },
      {
        'original': 'У контрасті',
        'translation': 'In contrast'
      },
      {
        'original': 'ще',
        'translation': 'Yet'
      },
      {
        'original': 'досі',
        'translation': 'Still'
      },
      {
        'original': 'Тим часом',
        'translation': 'Meanwhile'
      },
      {
        'original': 'Тим часом',
        'translation': 'Meanwhile'
      },
      {
        'original': 'Одночасно',
        'translation': 'Simultaneously'
      },
      {
        'original': 'Отже',
        'translation': 'Consequently'
      },
      {
        'original': 'тому',
        'translation': 'Therefore'
      },
      {
        'original': 'Таким чином',
        'translation': 'Thus'
      },
      {
        'original': 'Крім того',
        'translation': 'Moreover'
      },
      {
        'original': 'Крім того',
        'translation': 'Furthermore'
      },
      {
        'original': 'Додатково',
        'translation': 'Additionally'
      },
      {
        'original': 'В додаток',
        'translation': 'In addition'
      },
      {
        'original': 'Проте',
        'translation': 'However'
      },
      {
        'original': 'Тим не менш',
        'translation': 'Nevertheless'
      },
      {
        'original': 'Тим не менш',
        'translation': 'Nonetheless'
      },
      {
        'original': 'І навпаки',
        'translation': 'Conversely'
      },
      {
        'original': 'Тим часом',
        'translation': 'Meanwhile'
      },
      {
        'original': 'досі',
        'translation': 'Still'
      },
      {
        'original': 'ще',
        'translation': 'Yet'
      },
      {
        'original': 'Натомість',
        'translation': 'Instead'
      },
      {
        'original': 'Інакше',
        'translation': 'Otherwise'
      },
      {
        'original': 'Відповідно',
        'translation': 'Accordingly'
      },
      {
        'original': 'Отже',
        'translation': 'Consequently'
      },
      {
        'original': 'тому',
        'translation': 'Therefore'
      },
      {
        'original': 'Таким чином',
        'translation': 'Thus'
      },
      {
        'original': 'Крім того',
        'translation': 'Moreover'
      },
      {
        'original': 'Крім того',
        'translation': 'Furthermore'
      },
      {
        'original': 'Додатково',
        'translation': 'Additionally'
      },
      {
        'original': 'В додаток',
        'translation': 'In addition'
      },
      {
        'original': 'Насправді',
        'translation': 'In fact'
      },
      {
        'original': 'Тим не менш',
        'translation': 'Nevertheless'
      },
      {
        'original': 'Тим не менш',
        'translation': 'Nonetheless'
      },
      {
        'original': 'І навпаки',
        'translation': 'Conversely'
      },
      {
        'original': 'Проте',
        'translation': 'However'
      }
    ],
    '100-interjection-words': [
      {
        'original': 'Ого',
        'translation': 'Wow'
      },
      {
        'original': 'ох',
        'translation': 'Oh'
      },
      {
        'original': 'Ах',
        'translation': 'Ah'
      },
      {
        'original': 'Ой!',
        'translation': 'Oops'
      },
      {
        'original': 'ха-ха',
        'translation': 'Haha'
      },
      {
        'original': 'Ура',
        'translation': 'Yay'
      },
      {
        'original': 'Ой',
        'translation': 'Ouch'
      },
      {
        'original': 'тьфу',
        'translation': 'Ugh'
      },
      {
        'original': 'Хм',
        'translation': 'Hm'
      },
      {
        'original': 'Ага',
        'translation': 'Aha'
      },
      {
        'original': 'Ек',
        'translation': 'Eek'
      },
      {
        'original': 'Фу',
        'translation': 'Phew'
      },
      {
        'original': 'ой',
        'translation': 'Yikes'
      },
      {
        'original': 'браво',
        'translation': 'Bravo'
      },
      {
        'original': 'Ура',
        'translation': 'Cheers'
      },
      {
        'original': 'Ура',
        'translation': 'Hooray'
      },
      {
        'original': 'Тссс',
        'translation': 'Shh'
      },
      {
        'original': 'Боже',
        'translation': 'Gosh'
      },
      {
        'original': 'Добре',
        'translation': 'Well'
      },
      {
        'original': 'так',
        'translation': 'Yeah'
      },
      {
        'original': 'ні',
        'translation': 'Nope'
      },
      {
        'original': 'ні',
        'translation': 'Nah'
      },
      {
        'original': 'Чорт',
        'translation': 'Darn'
      },
      {
        'original': 'ну',
        'translation': 'Gee'
      },
      {
        'original': 'Чорт',
        'translation': 'Dang'
      },
      {
        'original': 'Бінго',
        'translation': 'Bingo'
      },
      {
        'original': 'Ох',
        'translation': 'Ooh'
      },
      {
        'original': 'Ого',
        'translation': 'Aww'
      },
      {
        'original': 'Фуу',
        'translation': 'Eww'
      },
      {
        'original': 'гидота',
        'translation': 'Yuck'
      },
      {
        'original': 'Хм',
        'translation': 'Hmm'
      },
      {
        'original': 'га',
        'translation': 'Huh'
      },
      {
        'original': 'ой',
        'translation': 'Whoa'
      },
      {
        'original': 'О Боже мій',
        'translation': 'Omg'
      },
      {
        'original': 'О Боже мій',
        'translation': 'OMG'
      },
      {
        'original': 'О.М.Гош',
        'translation': 'OMGosh'
      },
      {
        'original': 'О Боже мій',
        'translation': 'OMG'
      },
      {
        'original': 'Господи',
        'translation': 'Jeez'
      },
      {
        'original': 'Боже',
        'translation': 'Jeeze'
      },
      {
        'original': 'Ой!',
        'translation': 'Oops'
      },
      {
        'original': 'Ой!',
        'translation': 'Oopsy'
      },
      {
        'original': 'Ой!',
        'translation': 'Oopsie'
      },
      {
        'original': 'Опсі-маргаритка',
        'translation': 'Oopsy-daisy'
      },
      {
        'original': 'Ого',
        'translation': 'Aww'
      },
      {
        'original': 'трепет',
        'translation': 'Awe'
      },
      {
        'original': 'Ура',
        'translation': 'Yay'
      },
      {
        'original': 'так',
        'translation': 'Yea'
      },
      {
        'original': 'Так',
        'translation': 'Yes'
      },
      {
        'original': 'Немає',
        'translation': 'No'
      },
      {
        'original': 'ні',
        'translation': 'Nah'
      },
      {
        'original': 'ні',
        'translation': 'Nope'
      },
      {
        'original': 'Ну-у-у',
        'translation': 'Nuh-uh'
      },
      {
        'original': 'Угу',
        'translation': 'Uh-huh'
      },
      {
        'original': 'Гаразд',
        'translation': 'Okay'
      },
      {
        'original': 'Окі докі',
        'translation': 'Okey-dokey'
      },
      {
        'original': 'добре',
        'translation': 'Alright'
      },
      {
        'original': 'Вау',
        'translation': 'Whew'
      },
      {
        'original': 'Wowza',
        'translation': 'Wowza'
      },
      {
        'original': 'Тіппі',
        'translation': 'Yippee'
      },
      {
        'original': 'о Боже',
        'translation': 'Oh dear'
      },
      {
        'original': 'Добре горе',
        'translation': 'Good grief'
      },
      {
        'original': 'о Боже',
        'translation': 'Oh my'
      },
      {
        'original': 'Ну добре',
        'translation': 'Oh well'
      },
      {
        'original': 'о Боже',
        'translation': 'Oh dear'
      },
      {
        'original': 'о ні',
        'translation': 'Oh no'
      },
      {
        'original': 'о так',
        'translation': 'Oh yeah'
      },
      {
        'original': 'О, малюк',
        'translation': 'Oh boy'
      },
      {
        'original': 'Ой ля ля',
        'translation': 'Oh la la'
      },
      {
        'original': 'О боже',
        'translation': 'Oh golly'
      },
      {
        'original': 'о Боже',
        'translation': 'Oh my goodness'
      },
      {
        'original': 'о Боже',
        'translation': 'Oh my gosh'
      },
      {
        'original': 'Боже милостивий',
        'translation': 'Oh my goodness gracious'
      },
      {
        'original': 'О мій пане',
        'translation': 'Oh my lord'
      },
      {
        'original': 'О мої дні',
        'translation': 'Oh my days'
      },
      {
        'original': 'Ой стріляти',
        'translation': 'Oh shoot'
      },
      {
        'original': 'Ох',
        'translation': 'Oh snap'
      },
      {
        'original': 'Боже мойе',
        'translation': 'Oh dear me'
      },
      {
        'original': 'О мої небеса',
        'translation': 'Oh my heavens'
      }
    ],
    '100-nouns': [
      {
        'original': 'час',
        'translation': 'Time'
      },
      {
        'original': 'Люди',
        'translation': 'People'
      },
      {
        'original': 'шлях',
        'translation': 'Way'
      },
      {
        'original': 'День',
        'translation': 'Day'
      },
      {
        'original': 'рік',
        'translation': 'Year'
      },
      {
        'original': 'Уряд',
        'translation': 'Government'
      },
      {
        'original': 'Компанія',
        'translation': 'Company'
      },
      {
        'original': 'система',
        'translation': 'System'
      },
      {
        'original': 'програма',
        'translation': 'Program'
      },
      {
        'original': 'проблема',
        'translation': 'Problem'
      },
      {
        'original': 'Факт',
        'translation': 'Fact'
      },
      {
        'original': 'Робота',
        'translation': 'Work'
      },
      {
        'original': 'Справа',
        'translation': 'Case'
      },
      {
        'original': 'Група',
        'translation': 'Group'
      },
      {
        'original': 'використання',
        'translation': 'Use'
      },
      {
        'original': 'Сервіс',
        'translation': 'Service'
      },
      {
        'original': 'Результат',
        'translation': 'Result'
      },
      {
        'original': 'частина',
        'translation': 'Part'
      },
      {
        'original': 'Місце',
        'translation': 'Place'
      },
      {
        'original': 'Інформація',
        'translation': 'Information'
      },
      {
        'original': 'Веб-сайт',
        'translation': 'Website'
      },
      {
        'original': 'Дані',
        'translation': 'Data'
      },
      {
        'original': 'Інтернет',
        'translation': 'Internet'
      },
      {
        'original': 'світ',
        'translation': 'World'
      },
      {
        'original': 'технології',
        'translation': 'Technology'
      },
      {
        'original': 'Бізнес',
        'translation': 'Business'
      },
      {
        'original': 'Ідея',
        'translation': 'Idea'
      },
      {
        'original': 'Продукт',
        'translation': 'Product'
      },
      {
        'original': 'гроші',
        'translation': 'Money'
      },
      {
        'original': 'Ринок',
        'translation': 'Market'
      },
      {
        'original': 'ЗМІ',
        'translation': 'Media'
      },
      {
        'original': 'Зміст',
        'translation': 'Content'
      },
      {
        'original': 'Зображення',
        'translation': 'Image'
      },
      {
        'original': 'відео',
        'translation': 'Video'
      },
      {
        'original': 'музика',
        'translation': 'Music'
      },
      {
        'original': 'Соціальний',
        'translation': 'Social'
      },
      {
        'original': 'Мережа',
        'translation': 'Network'
      },
      {
        'original': 'Друг',
        'translation': 'Friend'
      },
      {
        'original': 'Спільнота',
        'translation': 'Community'
      },
      {
        'original': 'Користувач',
        'translation': 'User'
      },
      {
        'original': 'Досвід',
        'translation': 'Experience'
      },
      {
        'original': 'Платформа',
        'translation': 'Platform'
      },
      {
        'original': 'додаток',
        'translation': 'App'
      },
      {
        'original': 'пристрій',
        'translation': 'Device'
      },
      {
        'original': 'програмне забезпечення',
        'translation': 'Software'
      },
      {
        'original': 'додаток',
        'translation': 'App'
      },
      {
        'original': 'пристрій',
        'translation': 'Device'
      },
      {
        'original': 'програмне забезпечення',
        'translation': 'Software'
      },
      {
        'original': 'Гра',
        'translation': 'Game'
      },
      {
        'original': 'Дизайн',
        'translation': 'Design'
      },
      {
        'original': 'ст',
        'translation': 'Art'
      },
      {
        'original': 'Стиль',
        'translation': 'Style'
      },
      {
        'original': 'Тренд',
        'translation': 'Trend'
      },
      {
        'original': 'Новини',
        'translation': 'News'
      },
      {
        'original': 'Подія',
        'translation': 'Event'
      },
      {
        'original': 'Розповідь',
        'translation': 'Story'
      },
      {
        'original': 'проблема',
        'translation': 'Problem'
      },
      {
        'original': 'Рішення',
        'translation': 'Solution'
      },
      {
        'original': 'Мета',
        'translation': 'Goal'
      },
      {
        'original': 'План',
        'translation': 'Plan'
      },
      {
        'original': 'Демонструвати',
        'translation': 'Project'
      },
      {
        'original': 'Майстерність',
        'translation': 'Skill'
      },
      {
        'original': 'Освіта',
        'translation': 'Education'
      },
      {
        'original': 'Наука',
        'translation': 'Science'
      },
      {
        'original': 'дослідження',
        'translation': 'Research'
      },
      {
        'original': 'Відкриття',
        'translation': 'Discovery'
      },
      {
        'original': 'Здоров\'я',
        'translation': 'Health'
      },
      {
        'original': 'Ліки',
        'translation': 'Medicine'
      },
      {
        'original': 'лікар',
        'translation': 'Doctor'
      },
      {
        'original': 'пацієнт',
        'translation': 'Patient'
      },
      {
        'original': 'харчування',
        'translation': 'Food'
      },
      {
        'original': 'рецепт',
        'translation': 'Recipe'
      },
      {
        'original': 'Ресторан',
        'translation': 'Restaurant'
      },
      {
        'original': 'Подорожі',
        'translation': 'Travel'
      },
      {
        'original': 'Пункт призначення',
        'translation': 'Destination'
      },
      {
        'original': 'Пригода',
        'translation': 'Adventure'
      },
      {
        'original': 'природа',
        'translation': 'Nature'
      },
      {
        'original': 'Навколишнє середовище',
        'translation': 'Environment'
      },
      {
        'original': 'Клімат',
        'translation': 'Climate'
      },
      {
        'original': 'Зміна',
        'translation': 'Change'
      },
      {
        'original': 'політика',
        'translation': 'Policy'
      },
      {
        'original': 'Закон',
        'translation': 'Law'
      },
      {
        'original': 'Справедливість',
        'translation': 'Justice'
      },
      {
        'original': 'Свобода',
        'translation': 'Freedom'
      },
      {
        'original': 'Демократія',
        'translation': 'Democracy'
      },
      {
        'original': 'суспільство',
        'translation': 'Society'
      },
      {
        'original': 'Культура',
        'translation': 'Culture'
      },
      {
        'original': 'ст',
        'translation': 'Art'
      },
      {
        'original': 'Література',
        'translation': 'Literature'
      },
      {
        'original': 'Мова',
        'translation': 'Language'
      },
      {
        'original': 'Розмова',
        'translation': 'Conversation'
      },
      {
        'original': 'стосунки',
        'translation': 'Relationship'
      },
      {
        'original': 'кохання',
        'translation': 'Love'
      },
      {
        'original': 'Сім\'я',
        'translation': 'Family'
      },
      {
        'original': 'Друг',
        'translation': 'Friend'
      },
      {
        'original': 'Спільнота',
        'translation': 'Community'
      },
      {
        'original': 'Досвід',
        'translation': 'Experience'
      },
      {
        'original': 'Пам\'ять',
        'translation': 'Memory'
      },
      {
        'original': 'Емоція',
        'translation': 'Emotion'
      },
      {
        'original': 'Почуття',
        'translation': 'Feeling'
      }
    ],
    '100-preposition-words': [
      {
        'original': 'про',
        'translation': 'About'
      },
      {
        'original': 'вище',
        'translation': 'Above'
      },
      {
        'original': 'Поперек',
        'translation': 'Across'
      },
      {
        'original': 'Після',
        'translation': 'After'
      },
      {
        'original': 'Проти',
        'translation': 'Against'
      },
      {
        'original': 'разом',
        'translation': 'Along'
      },
      {
        'original': 'Серед',
        'translation': 'Amid'
      },
      {
        'original': 'серед',
        'translation': 'Among'
      },
      {
        'original': 'Навколо',
        'translation': 'Around'
      },
      {
        'original': 'на',
        'translation': 'At'
      },
      {
        'original': 'Раніше',
        'translation': 'Before'
      },
      {
        'original': 'Позаду',
        'translation': 'Behind'
      },
      {
        'original': 'Нижче',
        'translation': 'Below'
      },
      {
        'original': 'Внизу',
        'translation': 'Beneath'
      },
      {
        'original': 'поруч',
        'translation': 'Beside'
      },
      {
        'original': 'Між',
        'translation': 'Between'
      },
      {
        'original': 'За межами',
        'translation': 'Beyond'
      },
      {
        'original': 'але',
        'translation': 'But'
      },
      {
        'original': 'за',
        'translation': 'By'
      },
      {
        'original': 'Стосовно',
        'translation': 'Concerning'
      },
      {
        'original': 'враховуючи',
        'translation': 'Considering'
      },
      {
        'original': 'Незважаючи на те',
        'translation': 'Despite'
      },
      {
        'original': 'вниз',
        'translation': 'Down'
      },
      {
        'original': 'Протягом',
        'translation': 'During'
      },
      {
        'original': 'За винятком',
        'translation': 'Except'
      },
      {
        'original': 'для',
        'translation': 'For'
      },
      {
        'original': 'Від',
        'translation': 'From'
      },
      {
        'original': 'в',
        'translation': 'In'
      },
      {
        'original': 'Всередині',
        'translation': 'Inside'
      },
      {
        'original': 'в',
        'translation': 'Into'
      },
      {
        'original': 'Люблю',
        'translation': 'Like'
      },
      {
        'original': 'Близько',
        'translation': 'Near'
      },
      {
        'original': 'з',
        'translation': 'Of'
      },
      {
        'original': 'Вимкнено',
        'translation': 'Off'
      },
      {
        'original': 'Увімкнено',
        'translation': 'On'
      },
      {
        'original': 'на',
        'translation': 'Onto'
      },
      {
        'original': 'Вийти',
        'translation': 'Out'
      },
      {
        'original': 'Ззовні',
        'translation': 'Outside'
      },
      {
        'original': 'закінчено',
        'translation': 'Over'
      },
      {
        'original': 'минуле',
        'translation': 'Past'
      },
      {
        'original': 'Щодо',
        'translation': 'Regarding'
      },
      {
        'original': 'Круглий',
        'translation': 'Round'
      },
      {
        'original': 'Оскільки',
        'translation': 'Since'
      },
      {
        'original': 'Через',
        'translation': 'Through'
      },
      {
        'original': 'Всюди',
        'translation': 'Throughout'
      },
      {
        'original': 'до',
        'translation': 'To'
      },
      {
        'original': 'назустріч',
        'translation': 'Toward'
      },
      {
        'original': 'Під',
        'translation': 'Under'
      },
      {
        'original': 'Знизу',
        'translation': 'Underneath'
      },
      {
        'original': 'Поки',
        'translation': 'Until'
      },
      {
        'original': 'До',
        'translation': 'Unto'
      },
      {
        'original': 'вгору',
        'translation': 'Up'
      },
      {
        'original': 'Після',
        'translation': 'Upon'
      },
      {
        'original': 'с',
        'translation': 'With'
      },
      {
        'original': 'В межах',
        'translation': 'Within'
      },
      {
        'original': 'без',
        'translation': 'Without'
      },
      {
        'original': 'Всюди',
        'translation': 'Throughout'
      },
      {
        'original': 'поруч',
        'translation': 'Alongside'
      },
      {
        'original': 'На борту',
        'translation': 'Aboard'
      },
      {
        'original': 'Серед',
        'translation': 'Amidst'
      },
      {
        'original': 'Позаду',
        'translation': 'Behind'
      },
      {
        'original': 'передній',
        'translation': 'Fore'
      },
      {
        'original': 'щоб не',
        'translation': 'Lest'
      },
      {
        'original': 'середина',
        'translation': 'Midst'
      },
      {
        'original': 'незважаючи на',
        'translation': 'Notwithstanding'
      },
      {
        'original': 'пер',
        'translation': 'Per'
      },
      {
        'original': 'середина',
        'translation': 'Mid'
      },
      {
        'original': 'Через',
        'translation': 'Thru'
      },
      {
        'original': 'до',
        'translation': 'Till'
      },
      {
        'original': 'назустріч',
        'translation': 'Toward'
      },
      {
        'original': 'Знизу',
        'translation': 'Underneath'
      },
      {
        'original': 'Звідки',
        'translation': 'Whence'
      },
      {
        'original': 'Де',
        'translation': 'Where'
      },
      {
        'original': 'близько',
        'translation': 'Nigh'
      },
      {
        'original': 'ніж',
        'translation': 'Than'
      },
      {
        'original': 'Люблю',
        'translation': 'Like'
      },
      {
        'original': 'Подібні',
        'translation': 'Alike'
      },
      {
        'original': 'На відміну від',
        'translation': 'Unlike'
      },
      {
        'original': 'Близько',
        'translation': 'Near'
      },
      {
        'original': 'далеко',
        'translation': 'Far'
      }
    ],
    '100-verbs': [
      {
        'original': 'Пошук',
        'translation': 'Search'
      },
      {
        'original': 'знайти',
        'translation': 'Find'
      },
      {
        'original': 'використання',
        'translation': 'Use'
      },
      {
        'original': 'Досліджуйте',
        'translation': 'Explore'
      },
      {
        'original': 'Відкрийте для себе',
        'translation': 'Discover'
      },
      {
        'original': 'Поділіться',
        'translation': 'Share'
      },
      {
        'original': 'Опублікувати',
        'translation': 'Post'
      },
      {
        'original': 'коментар',
        'translation': 'Comment'
      },
      {
        'original': 'Люблю',
        'translation': 'Like'
      },
      {
        'original': 'Слідуйте',
        'translation': 'Follow'
      },
      {
        'original': 'твіт',
        'translation': 'Tweet'
      },
      {
        'original': 'оновлення',
        'translation': 'Update'
      },
      {
        'original': 'Завантажити',
        'translation': 'Upload'
      },
      {
        'original': 'Завантажити',
        'translation': 'Download'
      },
      {
        'original': 'встановити',
        'translation': 'Install'
      },
      {
        'original': 'Оновлення',
        'translation': 'Upgrade'
      },
      {
        'original': 'вчитися',
        'translation': 'Learn'
      },
      {
        'original': 'Прочитайте',
        'translation': 'Read'
      },
      {
        'original': 'Напишіть',
        'translation': 'Write'
      },
      {
        'original': 'Створити',
        'translation': 'Create'
      },
      {
        'original': 'Редагувати',
        'translation': 'Edit'
      },
      {
        'original': 'Видалити',
        'translation': 'Delete'
      },
      {
        'original': 'зберегти',
        'translation': 'Save'
      },
      {
        'original': 'ВІДЧИНЕНО',
        'translation': 'Open'
      },
      {
        'original': 'Закрити',
        'translation': 'Close'
      },
      {
        'original': 'грати',
        'translation': 'Play'
      },
      {
        'original': 'Дивитися',
        'translation': 'Watch'
      },
      {
        'original': 'Слухай',
        'translation': 'Listen'
      },
      {
        'original': 'Потік',
        'translation': 'Stream'
      },
      {
        'original': 'Підключитися',
        'translation': 'Connect'
      },
      {
        'original': 'Відключити',
        'translation': 'Disconnect'
      },
      {
        'original': 'Спілкуйтесь',
        'translation': 'Communicate'
      },
      {
        'original': 'Чат',
        'translation': 'Chat'
      },
      {
        'original': 'повідомлення',
        'translation': 'Message'
      },
      {
        'original': 'Електронна пошта',
        'translation': 'Email'
      },
      {
        'original': 'Підпишіться',
        'translation': 'Subscribe'
      },
      {
        'original': 'Відписатися',
        'translation': 'Unsubscribe'
      },
      {
        'original': 'Посилання',
        'translation': 'Link'
      },
      {
        'original': 'Вставити',
        'translation': 'Embed'
      },
      {
        'original': 'коментар',
        'translation': 'Comment'
      },
      {
        'original': 'Поділіться',
        'translation': 'Share'
      },
      {
        'original': 'Люблю',
        'translation': 'Like'
      },
      {
        'original': 'Не подобається',
        'translation': 'Dislike'
      },
      {
        'original': 'Рекомендую',
        'translation': 'Recommend'
      },
      {
        'original': 'огляд',
        'translation': 'Review'
      },
      {
        'original': 'Оцінка',
        'translation': 'Rate'
      },
      {
        'original': 'Магазин',
        'translation': 'Shop'
      },
      {
        'original': 'купити',
        'translation': 'Buy'
      },
      {
        'original': 'Продати',
        'translation': 'Sell'
      },
      {
        'original': 'Торгівля',
        'translation': 'Trade'
      },
      {
        'original': 'Переговори',
        'translation': 'Negotiate'
      },
      {
        'original': 'Інвестувати',
        'translation': 'Invest'
      },
      {
        'original': 'зберегти',
        'translation': 'Save'
      },
      {
        'original': 'Бюджет',
        'translation': 'Budget'
      },
      {
        'original': 'План',
        'translation': 'Plan'
      },
      {
        'original': 'Організуйте',
        'translation': 'Organize'
      },
      {
        'original': 'Керувати',
        'translation': 'Manage'
      },
      {
        'original': 'КОНТРОЛЬ',
        'translation': 'Control'
      },
      {
        'original': 'Монітор',
        'translation': 'Monitor'
      },
      {
        'original': 'Аналізуйте',
        'translation': 'Analyze'
      },
      {
        'original': 'Оцініть',
        'translation': 'Evaluate'
      },
      {
        'original': 'Оцінити',
        'translation': 'Assess'
      },
      {
        'original': 'Розв\'язати',
        'translation': 'Solve'
      },
      {
        'original': 'Виправити',
        'translation': 'Fix'
      },
      {
        'original': 'Поліпшити',
        'translation': 'Improve'
      },
      {
        'original': 'Оптимізувати',
        'translation': 'Optimize'
      },
      {
        'original': 'Налаштувати',
        'translation': 'Customize'
      },
      {
        'original': 'Персоналізація',
        'translation': 'Personalize'
      },
      {
        'original': 'Оновлення',
        'translation': 'Upgrade'
      },
      {
        'original': 'оновлення',
        'translation': 'Update'
      },
      {
        'original': 'встановити',
        'translation': 'Install'
      },
      {
        'original': 'Налаштувати',
        'translation': 'Configure'
      },
      {
        'original': 'Навігація',
        'translation': 'Navigate'
      },
      {
        'original': 'Прокрутка',
        'translation': 'Scroll'
      },
      {
        'original': 'Натисніть',
        'translation': 'Click'
      },
      {
        'original': 'Поділіться',
        'translation': 'Share'
      },
      {
        'original': 'Тег',
        'translation': 'Tag'
      },
      {
        'original': 'Згадка',
        'translation': 'Mention'
      },
      {
        'original': 'Перевірте',
        'translation': 'Check'
      },
      {
        'original': 'Підтвердити',
        'translation': 'Verify'
      },
      {
        'original': 'Підтвердити',
        'translation': 'Confirm'
      },
      {
        'original': 'Погодьтеся',
        'translation': 'Agree'
      },
      {
        'original': 'Не згоден',
        'translation': 'Disagree'
      },
      {
        'original': 'Обговоріть',
        'translation': 'Discuss'
      },
      {
        'original': 'дебати',
        'translation': 'Debate'
      },
      {
        'original': 'Аргументуйте',
        'translation': 'Argue'
      },
      {
        'original': 'брати участь',
        'translation': 'Participate'
      },
      {
        'original': 'Залучати',
        'translation': 'Engage'
      },
      {
        'original': 'Внести свій внесок',
        'translation': 'Contribute'
      },
      {
        'original': 'Співпрацювати',
        'translation': 'Collaborate'
      },
      {
        'original': 'Підключитися',
        'translation': 'Connect'
      },
      {
        'original': 'Посилання',
        'translation': 'Link'
      },
      {
        'original': 'Мережа',
        'translation': 'Network'
      },
      {
        'original': 'Надихайте',
        'translation': 'Inspire'
      },
      {
        'original': 'Мотивувати',
        'translation': 'Motivate'
      },
      {
        'original': 'Заохочуйте',
        'translation': 'Encourage'
      },
      {
        'original': 'Підтримка',
        'translation': 'Support'
      },
      {
        'original': 'Виклик',
        'translation': 'Challenge'
      },
      {
        'original': 'адаптуватися',
        'translation': 'Adapt'
      },
      {
        'original': 'розвиватися',
        'translation': 'Evolve'
      }
    ],
    'countable': [
      {
        'original': 'більшість',
        'translation': 'Most'
      },
      {
        'original': 'багато',
        'translation': 'Many'
      },
      {
        'original': 'Небагато',
        'translation': 'Few'
      },
      {
        'original': 'Кілька',
        'translation': 'Several'
      },
      {
        'original': 'Багато',
        'translation': 'A lot of'
      },
      {
        'original': 'Декілька',
        'translation': 'A few'
      },
      {
        'original': 'Кілька',
        'translation': 'A couple of'
      },
      {
        'original': 'численні',
        'translation': 'Numerous'
      },
      {
        'original': 'Кожен',
        'translation': 'Each'
      },
      {
        'original': 'кожен',
        'translation': 'Every'
      }
    ],
    'linking-verbs': [
      {
        'original': 'Am',
        'translation': 'Am'
      },
      {
        'original': 'Є',
        'translation': 'Is'
      },
      {
        'original': 'Є',
        'translation': 'Are'
      },
      {
        'original': 'був',
        'translation': 'Was'
      },
      {
        'original': 'були',
        'translation': 'Were'
      },
      {
        'original': 'бути',
        'translation': 'Be'
      }
    ],
    'object-pronouns': [
      {
        'original': 'я',
        'translation': 'Me'
      },
      {
        'original': 'ви',
        'translation': 'You'
      },
      {
        'original': 'його',
        'translation': 'Him'
      },
      {
        'original': 'її',
        'translation': 'Her'
      },
      {
        'original': 'Це',
        'translation': 'It'
      },
      {
        'original': 'Нас',
        'translation': 'Us'
      },
      {
        'original': 'їх',
        'translation': 'Them'
      }
    ],
    'personal-pronouns': [
      {
        'original': 'я',
        'translation': 'I'
      },
      {
        'original': 'ви',
        'translation': 'You'
      },
      {
        'original': 'Він',
        'translation': 'He'
      },
      {
        'original': 'вона',
        'translation': 'She'
      },
      {
        'original': 'Це',
        'translation': 'It'
      },
      {
        'original': 'ми',
        'translation': 'We'
      },
      {
        'original': 'Вони',
        'translation': 'They'
      }
    ],
    'possesive-pronouns': [
      {
        'original': 'Шахта',
        'translation': 'Mine'
      },
      {
        'original': 'Ваша',
        'translation': 'Yours'
      },
      {
        'original': 'Його',
        'translation': 'His'
      },
      {
        'original': 'Її',
        'translation': 'Hers'
      },
      {
        'original': 'Його',
        'translation': 'Its'
      },
      {
        'original': 'Наші',
        'translation': 'Ours'
      },
      {
        'original': 'Їхній',
        'translation': 'Theirs'
      }
    ],
    'possesive-words': [
      {
        'original': 'мій',
        'translation': 'My'
      },
      {
        'original': 'ваш',
        'translation': 'Your'
      },
      {
        'original': 'Його',
        'translation': 'His'
      },
      {
        'original': 'її',
        'translation': 'Her'
      },
      {
        'original': 'Його',
        'translation': 'Its'
      },
      {
        'original': 'наш',
        'translation': 'Our'
      },
      {
        'original': 'їх',
        'translation': 'Their'
      }
    ],
    'question-complex-words': [
      {
        'original': 'Скільки',
        'translation': 'How much'
      },
      {
        'original': 'Скільки',
        'translation': 'How many'
      },
      {
        'original': 'Як часто',
        'translation': 'How often'
      },
      {
        'original': 'Як довго',
        'translation': 'How long'
      },
      {
        'original': 'Як далеко',
        'translation': 'How far'
      },
      {
        'original': 'Скільки років',
        'translation': 'How old'
      },
      {
        'original': 'Як прийшло',
        'translation': 'How come'
      },
      {
        'original': 'Як на рахунок',
        'translation': 'How about'
      },
      {
        'original': 'Як інакше',
        'translation': 'How else'
      },
      {
        'original': 'Як далеко',
        'translation': 'How far'
      },
      {
        'original': 'Як швидко',
        'translation': 'How fast'
      },
      {
        'original': 'Як високо',
        'translation': 'How high'
      },
      {
        'original': 'Як глибоко',
        'translation': 'How deep'
      },
      {
        'original': 'Який широкий',
        'translation': 'How wide'
      },
      {
        'original': 'Який товстий',
        'translation': 'How thick'
      },
      {
        'original': 'Як високий',
        'translation': 'How tall'
      },
      {
        'original': 'Наскільки великий',
        'translation': 'How big'
      },
      {
        'original': 'Як маленький',
        'translation': 'How small'
      },
      {
        'original': 'Який важкий',
        'translation': 'How heavy'
      },
      {
        'original': 'Як світло',
        'translation': 'How light'
      },
      {
        'original': 'Як дорого',
        'translation': 'How expensive'
      },
      {
        'original': 'Як дешево',
        'translation': 'How cheap'
      },
      {
        'original': 'Як важливо',
        'translation': 'How important'
      },
      {
        'original': 'Як важко',
        'translation': 'How difficult'
      },
      {
        'original': 'Як легко',
        'translation': 'How easy'
      },
      {
        'original': 'Наскільки ймовірно',
        'translation': 'How likely'
      },
      {
        'original': 'Як можливо',
        'translation': 'How possible'
      },
      {
        'original': 'Наскільки ймовірно',
        'translation': 'How probable'
      },
      {
        'original': 'Як певно',
        'translation': 'How certain'
      },
      {
        'original': 'Як впевнений',
        'translation': 'How sure'
      },
      {
        'original': 'Як правда',
        'translation': 'How true'
      }
    ],
    'question-words': [
      {
        'original': 'Що',
        'translation': 'What'
      },
      {
        'original': 'ВООЗ',
        'translation': 'Who'
      },
      {
        'original': 'кого',
        'translation': 'Whom'
      },
      {
        'original': 'Чия',
        'translation': 'Whose'
      },
      {
        'original': 'Котрий',
        'translation': 'Which'
      },
      {
        'original': 'Де',
        'translation': 'Where'
      },
      {
        'original': 'Коли',
        'translation': 'When'
      },
      {
        'original': 'чому',
        'translation': 'Why'
      },
      {
        'original': 'як',
        'translation': 'How'
      }
    ],
    'reflexive-pronouns': [
      {
        'original': 'себе',
        'translation': 'Myself'
      },
      {
        'original': 'себе',
        'translation': 'Yourself'
      },
      {
        'original': 'себе',
        'translation': 'Himself'
      },
      {
        'original': 'себе',
        'translation': 'Herself'
      },
      {
        'original': 'себе',
        'translation': 'Itself'
      },
      {
        'original': 'Ми самі',
        'translation': 'Ourselves'
      },
      {
        'original': 'самі',
        'translation': 'Themselves'
      }
    ],
    'uncountable': [
      {
        'original': 'багато',
        'translation': 'Much'
      },
      {
        'original': 'більше',
        'translation': 'More'
      },
      {
        'original': 'Багато',
        'translation': 'A lot of'
      },
      {
        'original': 'Трохи',
        'translation': 'A bit of'
      },
      {
        'original': 'Дещо',
        'translation': 'Some'
      },
      {
        'original': 'Багато',
        'translation': 'A great deal of'
      },
      {
        'original': 'Багато',
        'translation': 'Plenty of'
      },
      {
        'original': 'Достатньо',
        'translation': 'Enough'
      },
      {
        'original': 'мало',
        'translation': 'Little'
      },
      {
        'original': 'Відсутність',
        'translation': 'A lack of'
      }
    ]
  }

  const INITIAL_STATE = {
    profile: null,
    currentFolderId: null,
    folders: FOLDERS_SAMPLE_DATA_EN,
    foldersEntries: FOLDER_ENTRIES_SAMPLE_DATA_EN,
    config: {
      ignoredOrigins: [],
      youtubeAudioReplaceON: false,
      disabledAtAll: false,

      highlightColor: '#ff0000',

      fromLang: 'uk',
      lang: 'uk',
      theme: 'uk',

      toLang: 'en',

      onboarded: false,
      pronounceWord: true,
      highlightWords: true,

      highlightTranslationBgColor: '#ffbcff',
      highlightTranslationColor: '#ffbcff',
    },
    router: {
      path: 'dictionary',
    },
  }

  const CONSTANTS = {
    clientInfo: {
      origin: window.location.origin,
    }, payment: {
      serviceLink: 'https://www.privat24.ua/rd/send_qr/liqpay_static_qr/qr_beb71f537aab43ecaceab4cd7670d36b',
    },
  }

  const CURSE_WORDS = ['хто', 'патрон', 'пес',]

  class _LangsUtils {
    static #LANGS = {
      'uk': 'uk', 'en': 'en', 'zh': 'zh',
    }
    static #PLURAL_ENDINGS = {
      [_LangsUtils.#LANGS.en]: 's', [_LangsUtils.#LANGS.uk]: 'и', [_LangsUtils.#LANGS.zh]: '们',
    }

    static getLanguageByLetter = (letter) => {
      const englishRegex = /[a-zA-Z]/
      const cyrillicRegex = /[а-яА-Я]/
      const chineseRegex = /[\u4E00-\u9FFF]/

      if (englishRegex.test(letter)) {
        return _LangsUtils.#LANGS.en
      } else if (cyrillicRegex.test(letter)) {
        return _LangsUtils.#LANGS.uk
      } else if (chineseRegex.test(letter)) {
        return _LangsUtils.#LANGS.zh
      }

      return null
    }

    static langToPluralEnding = (lang) => {
      return _LangsUtils.#PLURAL_ENDINGS[lang] || null
    }

    static getPluralEndings = () => {
      return Object.values(_LangsUtils.#PLURAL_ENDINGS)
    }

    static pluralize = (word) => {
      const lastLetter = word.slice(-1)
      const lang = _LangsUtils.getLanguageByLetter(lastLetter)
      const pluralEnding = _LangsUtils.langToPluralEnding(lang)

      // Prevent issues:
      // news => newss
      if (lastLetter === pluralEnding) {
        return word
      }

      // Prevent issues:
      // Нога => Ногаи
      if (lang === _LangsUtils.#LANGS.uk) {
        return word.slice(0, -1) + pluralEnding
      }

      return word + pluralEnding
    }

    static isPlural = (word, singularWord) => {
      if (!singularWord) {
        throw new Error('singularWord is required to prevent issues like (we => wes)')
      }

      // Prevent issues:
      // we => wes
      // news => newss
      if (word.toLowerCase() === singularWord.toLowerCase()) {
        return false
      }

      // Prevent issues:
      // a => as
      if (word.length < 2) {
        return false
      }

      const lastLetter = word.slice(-1)
      const lang = _LangsUtils.getLanguageByLetter(lastLetter)
      const pluralEnding = _LangsUtils.langToPluralEnding(lang)
      return lastLetter === pluralEnding
    }
  }

  class _NumberUtils {
    static isNumeric = (str) => /^\d+$/.test(str)
    static isNumberBetweenEquals = (number, min, max) => number >= min && number <= max
  }

  class _DOMUtils {
    static #INPUT_TAGS = ['textarea', 'input', 'select']

    static isInputNode(node) {
      return (_DOMUtils.#INPUT_TAGS.includes(node.tagName.toLowerCase()) || node.contentEditable === 'true' || node.role === 'textbox' || node.role === 'listbox')
    }

    static traverseParent = (node, callback) => {
      let parent = node.parentNode
      while (parent !== null) {
        if (callback(parent)) {
          return true
        }
        parent = parent.parentElement
      }
      return false
    }

    static isInViewport = (node) => {
      let element = node
      if (node.nodeType === Node.TEXT_NODE) {
        node = element.parentElement
      }

      if (!node) {
        return false
      }

      const rect = node.getBoundingClientRect()
      return (rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth))
    }
  }

  class _StringUtils {
    static replaceRandomWord = (str, newWord) => {
      const words = str.split(' ')
      const randomIndex = Math.floor(Math.random() * words.length)
      words[randomIndex] = newWord
      return words.join(' ')
    }
    static capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1)
    static lowerCaseFirstLetter = (str) => str.charAt(0).toLowerCase() + str.slice(1)
  }

  class _ArrayUtils {
    static getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
  }


  class ForCycleWithAsyncBatching {
    static processBatch(array, cb) {
      setTimeout(() => {
        for (const item of array) {
          cb(item)
        }
      })
    }

    static forOf(array, cb, batchSize = 100) {
      const length = array.length
      const batchCount = Math.max(length / batchSize)

      const batchArrays = []

      for (let i = 0; i < batchCount; i++) {
        const start = i * batchSize
        const end = Math.min(start + batchSize, length)
        batchArrays.push(array.slice(start, end))
      }

      for (const sliceElement of batchArrays) {
        ForCycleWithAsyncBatching.processBatch(sliceElement, cb)
      }
    }
  }

  class Store {
    constructor(key, defaultValue, { version }) {
      this.key = key
      this.version = version
      this.keyWithVersion = Store.getKeyWithVersion(key, version)
      this.defaultValue = defaultValue

      Store.cleanPreviousVersions(key, version)
    }

    static getKeyWithVersion(key, version) {
      return key + '_' + version
    }

    static cleanPreviousVersions(key, version) {
      const keyWithVersion = Store.getKeyWithVersion(key, version)

      return chrome.storage.local.get().then((result) => {
        for (const resultKey in result) {
          if (resultKey.includes(key) && resultKey !== keyWithVersion) {
            chrome.storage.local.remove(resultKey)
          }
        }
      })
    }

    load() {
      return chrome.storage.local.get([this.keyWithVersion]).then((result) => result[this.keyWithVersion] ?? this.defaultValue)
    }

    save(payload) {
      return chrome.storage.local.set({ [this.keyWithVersion]: payload })
    }

    subscribe(callback) {
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes[this.keyWithVersion]) {
          callback(changes[this.keyWithVersion].newValue)
        }
      })
    }
  }


  class _MediaManager {
    static getVideoElements = () => document.querySelectorAll('video')
    static getPlayingVideoElements = () => [..._MediaManager.getVideoElements()].filter((el) => !el.paused)
    static getAudioElements = () => document.querySelectorAll('audio')
    static getPlayingAudioElements = () => [..._MediaManager.getAudioElements()].filter((el) => !el.paused)
  }

  class MediaVolumeLower extends _MediaManager {
    #lowerValue
    #loweredCollection = new Map()

    constructor(lowerValue) {
      super()
      this.#lowerValue = lowerValue
    }

    #lowerIfNeeded($el) {
      if ($el.volume > this.#lowerValue) {
        this.#loweredCollection.set($el, $el.volume)
        $el.volume = this.#lowerValue
      }
    }

    lower() {
      for (const $el of MediaVolumeLower.getPlayingAudioElements()) {
        this.#lowerIfNeeded($el)
      }
      for (const $el of MediaVolumeLower.getPlayingVideoElements()) {
        this.#lowerIfNeeded($el)
      }
    }

    higher() {
      for (const [$element, initialVolume] of this.#loweredCollection) {
        $element.volume = initialVolume
      }
    }
  }

  class MediaPauser extends _MediaManager {
    #affectedCollection = []

    #pauseIfNeeded($el) {
      if (!$el.paused) {
        this.#affectedCollection.push($el)
        $el.pause()
      }
    }

    pause() {
      for (const $el of MediaPauser.getPlayingAudioElements()) {
        this.#pauseIfNeeded($el)
      }
      for (const $el of MediaPauser.getPlayingVideoElements()) {
        this.#pauseIfNeeded($el)
      }
    }

    play() {
      for (const $element of this.#affectedCollection) {
        $element.play()
      }

      this.#affectedCollection = []
    }
  }

  class Utterer {
    #utterThis
    #mediaPauser
    #audioVolumeLower

    constructor({ rate, lang, useVolumeLower, useMediaPauser }) {
      this.#utterThis = new SpeechSynthesisUtterance()

      this.#utterThis.lang = lang
      this.#utterThis.rate = rate

      if (useVolumeLower) {
        this.#audioVolumeLower = new MediaVolumeLower(0.6)
        this.#utterThis.addEventListener('start', () => this.#audioVolumeLower.lower())
        this.#utterThis.addEventListener('end', () => this.#audioVolumeLower.higher())
        this.#utterThis.addEventListener('pause', () => this.#audioVolumeLower.higher())
      }

      if (useMediaPauser) {
        this.#mediaPauser = new MediaPauser()
        this.#utterThis.addEventListener('start', () => this.#mediaPauser.pause())
        this.#utterThis.addEventListener('end', () => this.#mediaPauser.play())
        // for canceling case
        this.#utterThis.addEventListener('error', () => this.#mediaPauser.play())
      }
    }

    speaking() {
      return speechSynthesis.speaking
    }

    setLang(lang) {
      this.#utterThis.lang = lang
    }

    speak(text, onEnd) {
      this.#utterThis.text = text
      speechSynthesis.speak(this.#utterThis)
      this.#utterThis.addEventListener('end', onEnd, { once: true })
    }

    cancel() {
      speechSynthesis.cancel()
    }
  }


  class Tooltip {
    static tooltipId = 'pll-tooltip'
    static #contentClassName = 'pll-tooltip-content'
    static #arrowClassName = 'pll-tooltip-arrow'

    static #$tooltip
    static #$tooltipContent

    static show(content, x, y) {
      Tooltip.#$tooltip.style.left = x + 'px'
      Tooltip.#$tooltip.style.top = (y - 16) + 'px'

      Tooltip.#$tooltipContent.innerHTML = content
    }

    static hide() {
      Tooltip.#$tooltip.style.left = ''
    }

    static #injectStyles() {
      const $style = document.createElement('style')
      $style.innerHTML = `
      #${Tooltip.tooltipId} {
          z-index: 9999999;
          position: fixed;
          left: -200px;
        }
        
      .${Tooltip.#contentClassName} {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, -100%);
        pointer-events: none;

        margin-bottom: 5px;
        padding: 7px;
        min-width: 80px;
        border-radius: 23px;
        border: 1px solid #ddd;

        background: linear-gradient(0deg, rgba(249, 255, 0, 1) 12%, rgba(0, 224, 255, 1) 82%);
        background-size: 100% 200%;
        color: #fff;
        box-shadow: 0 0 4px 1px yellow;
        text-shadow: -1px 0 rgba(0, 0, 0, 0.4), 0 1px rgba(0, 0, 0, 0.4), 1px 0 rgba(0, 0, 0, 0.4), 0 -1px rgba(0, 0, 0, 0.4);

        text-align: center;
        font-size: 18px;
        line-height: 1.2;

        animation: gradient 4s ease infinite forwards;
  }

.${Tooltip.#arrowClassName} {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 50%);
  pointer-events: none;

  width: 0;
  border-top: 5px solid black;
  border-right: 5px solid transparent;
  border-left: 5px solid transparent;
  font-size: 0;
  line-height: 0;
  animation: bounce 0.5s ease infinite forwards;
}
@keyframes bounce {
  0% {
    transform: translate(-50%, 50%) scale(0.5);
  }
  50% {
    transform: translate(-50%, 50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, 50%) scale(1);
  }
}


@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 0% -150%;
  }
  100% {
    background-position: 0% 50%;
  }
}

`
      document.head.appendChild($style)
    }

    static #injectHTML() {
      const $tooltip = document.createElement('div')

      $tooltip.id = Tooltip.tooltipId
      $tooltip.classList.add('pll-tooltip')
      $tooltip.innerHTML = `<div class="${Tooltip.#arrowClassName}"></div>
        <div class="${Tooltip.#contentClassName}"></div>`

      document.body.appendChild($tooltip)

      Tooltip.#$tooltip = $tooltip
      Tooltip.#$tooltipContent = $tooltip.querySelector('.' + Tooltip.#contentClassName)
    }

    static inject() {
      Tooltip.#injectHTML()
      Tooltip.#injectStyles()
    }
  }


  class _ReplacerUtils {
    static CODE_MARKUP_TAGS = ['pre', 'code']
    static IGNORED_TAGS = [..._ReplacerUtils.CODE_MARKUP_TAGS, 'script', 'style', 'svg', 'head']
    static NO_REPLACE_ATTR = 'pll-no-replace'
    static NO_HIGHLIGHT_ATTR = 'pll-no-highlight'
    static ALREADY_REPLACED_ATTR = 'pll-replaced'
    static #isSkipReplacingRules = []
    static CSS_VAR_HIGHLIGHT_COLOR_ORIGINAL = '--bg-word-original'
    static CSS_VAR_HIGHLIGHT_COLOR_TRANSLATION = '--bg-word-translation'
    static CSS_VAR_TEXT_COLOR = '--bg-word-color'
    static RegExpCache = new Map()

    static setColor = (cssVarName, color) => {
      window.document.body.style.setProperty(cssVarName, color)
    }

    static setHighlightTranslationBgColor = (color) => {
      _ReplacerUtils.setColor(_ReplacerUtils.CSS_VAR_HIGHLIGHT_COLOR_TRANSLATION, color)
    }

    static setHighlightTranslationColor = (color) => {
      _ReplacerUtils.setColor(_ReplacerUtils.CSS_VAR_TEXT_COLOR, color)
    }

    static setHighlightColor = (originalColor, translationColor, textColor) => {
      _ReplacerUtils.setColor(_ReplacerUtils.CSS_VAR_HIGHLIGHT_COLOR_ORIGINAL, originalColor)
      _ReplacerUtils.setHighlightTranslationBgColor(translationColor)
      _ReplacerUtils.setHighlightTranslationColor(textColor)
    }

    static makeHighlightTransparent = () => {
      _ReplacerUtils.setHighlightColor('transparent', 'transparent', '')
    }

    static makeHighlightColorful = (originalColor, translationColor, textColor) => {
      _ReplacerUtils.setHighlightColor(originalColor, translationColor, textColor)
    }

    static isReplaced = (node) => node.hasAttribute(_ReplacerUtils.ALREADY_REPLACED_ATTR)

    static isSkipReplacing = (node) => (
      (node.nodeType !== Element.TEXT_NODE
        && node.nodeType !== Element.ELEMENT_NODE
        && node.nodeType !== Element.DOCUMENT_FRAGMENT_NODE
        && node.nodeType !== Element.DOCUMENT_NODE)
      || _ReplacerUtils.IGNORED_TAGS.includes(node.tagName.toLowerCase())
      || _DOMUtils.isInputNode(node)
      || _ReplacerUtils.isReplaced(node)
      || _ReplacerUtils.#isSkipReplacingRules.some(rule => rule(node))
    )

    static addSkipReplacingRule = (rule) => _ReplacerUtils.#isSkipReplacingRules.push(rule)

    static isNoReplace = (node) => node.hasAttribute(_ReplacerUtils.NO_REPLACE_ATTR)
    static isNoHighlight = (node) => node.hasAttribute(_ReplacerUtils.NO_HIGHLIGHT_ATTR)

    static createMatchRegExp = (word) => {
      // NOTE: Is RegExp caching indeed needed to boost performance?
      if (_ReplacerUtils.RegExpCache.has(word)) {
        return _ReplacerUtils.RegExpCache.get(word)
      }

      let regExp

      if (_NumberUtils.isNumeric(word)) {
        regExp = new RegExp(word, 'm')
      } else {
        const anyLetter = '[-ʼ‘\'\\wієї\u0401\u0451\u0410-\u044f]'
        const pluralEndings = _LangsUtils.getPluralEndings().join('')
        const pluralPart = `[${pluralEndings}]`

        regExp = new RegExp(`(?<!${anyLetter})` + word + `${pluralPart}?(?!${anyLetter})`, 'im')
      }

      _ReplacerUtils.RegExpCache.set(word, regExp)

      return regExp
    }

    static matches = (node, word) => !!node.textContent.match(_ReplacerUtils.createMatchRegExp(word))

    static hasSkipReplacingParent(node) {
      return _DOMUtils.traverseParent(node, _ReplacerUtils.isSkipReplacing)
    }

    static hasNoReplaceParent(node) {
      return _DOMUtils.traverseParent(node, _ReplacerUtils.isNoReplace)
    }

    static hasNoHighlightParent(node) {
      return _DOMUtils.traverseParent(node, _ReplacerUtils.isNoHighlight)
    }
  }

  class DOMReplacer {
    #dictionary
    #onWordReplaced

    #MutationObserver = window.MutationObserver || window.WebKitMutationObserver
    #observer = new this.#MutationObserver((mutations) => {
      // To prevent an infinite loop after replaced the text, because it'd be a mutation.
      // Thanks to https://github.com/marcioggs/text-changer-chrome-extension/blob/master/scripts/changeText.js#L61
      this.#stopObserving()

      ForCycleWithAsyncBatching.forOf(mutations, (mutation) => {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            this.replaceWords(this.#dictionary, node)

            // TODO: Implement adding to queue and processing after all the words are replaced.
            // if (_DOMUtils.isInViewport(node)) {
            // } else {
            //
            // }
          }
        } else {
          this.replaceWords(this.#dictionary, mutation.target)
        }
      })

      this.#startObserving()
    })

    constructor({ dictionary, skipRules, onWordReplaced }) {
      this.#dictionary = dictionary
      this.#onWordReplaced = onWordReplaced

      skipRules.forEach(rule => _ReplacerUtils.addSkipReplacingRule(rule))
    }

    #startObserving = () => {
      this.#observer.observe(document.body, { subtree: true, childList: true, characterData: true, })
    }

    #stopObserving = () => {
      this.#observer.disconnect()
    }


    #replaceNew_needs_refactoring_has_exceptions(element, original, translation) {
      try {
        if (!element) {
          return
        }

        const regex = _ReplacerUtils.createMatchRegExp(original)

        var getNodes = function () {
          var nodes = [], offset = 0, node,
            nodeIterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT, null, false)

          while (node = nodeIterator.nextNode()) {
            nodes.push({
              textNode: node, start: offset, length: node.nodeValue.length
            })
            offset += node.nodeValue.length
          }
          return nodes
        }

        var nodes = getNodes()
        if (!nodes.length) return

        var text = ''
        for (var i = 0; i < nodes.length; ++i) text += nodes[i].textNode.nodeValue

        let match
        while (match = text.match(regex)) {
          // Prevent empty matches causing infinite loops
          if (!match[0].length) {
            continue
          }

          // Find the start and end text node
          var startNode = null, endNode = null
          for (i = 0; i < nodes.length; ++i) {
            var node = nodes[i]

            if (node.start + node.length <= match.index) continue

            if (!startNode) startNode = node

            if (node.start + node.length >= match.index + match[0].length) {
              endNode = node
              break
            }
          }

          var range = document.createRange()
          range.setStart(startNode.textNode, match.index - startNode.start)
          range.setEnd(endNode.textNode, match.index + match[0].length - endNode.start)

          const doNotReplace = _ReplacerUtils.hasNoReplaceParent(range.commonAncestorContainer)

          const spanNode = document.createElement('span')
          const varName = doNotReplace ? _ReplacerUtils.CSS_VAR_HIGHLIGHT_COLOR_ORIGINAL : _ReplacerUtils.CSS_VAR_HIGHLIGHT_COLOR_TRANSLATION
          spanNode.style.backgroundColor = `var(${varName})`
          spanNode.style.color = `var(${_ReplacerUtils.CSS_VAR_TEXT_COLOR})`
          // spanNode.style.fontWeight = 'bold'
          spanNode.setAttribute(_ReplacerUtils.ALREADY_REPLACED_ATTR, 'true')

          const extract = range.extractContents()

          if (doNotReplace) {
            const $fragment = new DocumentFragment()
            $fragment.append(extract.textContent)
            spanNode.appendChild($fragment)
            range.insertNode(spanNode)
            return
          } else {
            const $fragment = new DocumentFragment()

            const isCapitalCase = extract.textContent.charAt(0) === extract.textContent.charAt(0).toUpperCase()
            const isPlural = _LangsUtils.isPlural(extract.textContent, original)
            const translationInRightCase = isCapitalCase ? _StringUtils.capitalizeFirstLetter(translation) : _StringUtils.lowerCaseFirstLetter(translation)
            const translationFinal = isPlural ? _LangsUtils.pluralize(translationInRightCase) : translationInRightCase

            $fragment.append(translationFinal)
            spanNode.appendChild($fragment)
            range.insertNode(spanNode)
          }

          this.#onWordReplaced(spanNode, { original, translation })

          nodes = getNodes()
          text = ''

          for (let i = 0; i < nodes.length; ++i) {
            text += nodes[i].textNode.nodeValue
          }
        }
      } catch (e) {
        console.log(`%cUNEXPECTED ERROR: MINOR for future`, 'background: black; color: white;', {
          original, elementTextContent: element?.textContent
        })
        console.log(e)
      }
    }

    #replace(node, original, translation) {
      return this.#replaceNew_needs_refactoring_has_exceptions(node.parentNode, original, translation)
    }

    #filterTextNodesByWord(textNodes, word) {
      return textNodes.filter((node) => _ReplacerUtils.matches(node, word))
    }

    #getNodesThatCanContainMatches(node) {
      let queue = [node], curr, nodes = []

      while (curr = queue.pop()) {
        if (curr.nodeType === Node.TEXT_NODE) {
          nodes.push(curr)
        } else if (_ReplacerUtils.isSkipReplacing(curr)) {
          continue
        }

        for (const childNode of curr.childNodes) {
          queue.push(childNode)
        }
      }

      return nodes
    }

    replaceWords(dictionary, rootNode) {
      if (_ReplacerUtils.hasSkipReplacingParent(rootNode)) {
        return
      }

      const nodesThatCouldBeReplaced = this.#getNodesThatCanContainMatches(rootNode)

      ForCycleWithAsyncBatching.forOf(dictionary, ({ original, translation }) => {
        if (original === translation) {
          return
        }

        const matchedTextNodes = this.#filterTextNodesByWord(nodesThatCouldBeReplaced, original)

        for (const node of matchedTextNodes) {
          this.#replace(node, original, translation)

          if (rootNode.parentNode && rootNode.parentNode !== document) {
            rootNode = rootNode.parentNode
          }
        }
      }, 50)
    }

    setDictionaryAndReplace(dictionary) {
      this.#dictionary = dictionary
      this.replaceWords(dictionary, document.body)
    }

    enable(dictionary) {
      if (dictionary) {
        this.setDictionaryAndReplace(dictionary)
      } else {
        this.replaceWords(dictionary, document.body)
      }

      this.#startObserving(this.#observer)
    }
  }


  class SimpleEvent {
    #handlers = []

    static subscribe(handler) {
      SimpleEvent.#handlers.push(handler)
    }

    static unsubscribe(handler) {
      SimpleEvent.#handlers = SimpleEvent.#handlers.filter(existingHandler => existingHandler !== handler)
    }

    static emit(data) {
      SimpleEvent.#handlers.forEach(handler => handler(data))
    }
  }

  class Queue extends SimpleEvent {
    static #queue = []

    static enqueue(node) {
      Queue.#queue.push({ node })
      Queue.emit('enqueue')
    }

    static dequeue() {
      return Queue.#queue.shift()
    }

    static isEmpty() {
      return Queue.#queue.length === 0
    }
  }

  // TODO: For future use
  class WordsReplacerQueue extends Queue {
    #timerId
    #timerDelay = 1000

    static #tick() {
      if (WordsReplacerQueue.isEmpty()) {
        return
      }

      const { node } = WordsReplacerQueue.dequeue()
      WordsReplacer.replace(node)
    }

    static #startProcessing = () => {
      WordsReplacerQueue.#timerId = setTimeout(WordsReplacerQueue.#tick, WordsReplacerQueue.#timerDelay)
    }

    static #handleEnqueue = () => {
      WordsReplacerQueue.#startProcessing()
    }

    static #handleEvent = (event) => {
      if (event === 'enqueue') {
        WordsReplacerQueue.#handleEnqueue()
      }
    }

    static enable = () => {
      WordsReplacerQueue.subscribe(WordsReplacerQueue.#handleEvent)
    }
  }


  class YoutubeApiExposer {
    static scriptInjected = false
    static #newVideoCaptionUrlListeners = []

    static inject = () => {
      ScriptManager.injectScriptToPage(
        'shared-resources/core/injectable-content-script-that-can-access-anything.js',
        YoutubeSubtitlesSpeech.scriptId
      )
      YoutubeApiExposer.scriptInjected = true
    }

    static #handleMessage = (e) => {
      if (e.data.type === 'pll-update-subtitles') {
        if (e.data.data) {
          for (const newVideoCaptionUrlListener of YoutubeApiExposer.#newVideoCaptionUrlListeners) {
            newVideoCaptionUrlListener(e.data.data)
          }
        }
      }
    }

    static listenForInjectedScript = () => {
      window.addEventListener('message', YoutubeApiExposer.#handleMessage)
    }

    static removeListenerOfInjectedScript = () => {
      window.removeEventListener('message', YoutubeApiExposer.#handleMessage)
    }

    static addNewVideoCaptionUrlListener = (listener) => {
      YoutubeApiExposer.#newVideoCaptionUrlListeners.push(listener)
    }

    static removeNewVideoCaptionUrlListener = (listener) => {
      YoutubeApiExposer.#newVideoCaptionUrlListeners = YoutubeApiExposer.#newVideoCaptionUrlListeners.filter(l => l !== listener)
    }
  }

  class YoutubeSubtitlesSpeech {
    static utterThis2 = new Utterer({ useVolumeLower: true, rate: 1.2 })
    static #enabled = false
    static #engineEnabled = false
    static #segments
    static #dictionaryMap
    static #$player
    static #langFrom
    static #langTo
    static #captionUrl

    static scriptId = 'pll-youtube-api-exposer-script'


    static #normalizeYoutubeCaptions = (captionEvents) => {
      const out = []

      let event, nextEvent
      for (let i = 0; i < captionEvents.length; i++) {
        event = captionEvents[i]

        if (!event.segs?.length) {
          continue
        }

        nextEvent = captionEvents[i + 1]

        const start = event.tStartMs
        const end = nextEvent?.tStartMs !== undefined ? nextEvent.tStartMs : (event.tStartMs + event.dDurationMs)

        let segment, nextSegment
        for (let j = 0; j < event.segs.length; j++) {
          segment = event.segs[j]

          if (!segment.utf8) {
            continue
          }

          nextSegment = event.segs[j + 1]

          out.push({
            text: segment.utf8,
            start: start + (segment.tOffsetMs ?? 0),
            end: nextSegment?.tOffsetMs !== undefined ? (start + nextSegment?.tOffsetMs) : end,
          })
        }
      }

      return out
    }

    static #downloadCaptions = async () => {
      const captionUrl = YoutubeSubtitlesSpeech.#captionUrl
      if (!captionUrl) {
        return
      }

      let urlWithRightLang = captionUrl.replace(/&lang=[^&]+/, `&lang=` + YoutubeSubtitlesSpeech.#langFrom)
      urlWithRightLang += '&fmt=json3'
      urlWithRightLang += '&tlang=' + YoutubeSubtitlesSpeech.#langTo

      YoutubeSubtitlesSpeech.#segments = await fetch(urlWithRightLang)
        .then(r => r.json())
        .then((result) => YoutubeSubtitlesSpeech.#normalizeYoutubeCaptions(result.events))

      YoutubeSubtitlesSpeech.#$player = _MediaManager.getVideoElements()?.[0]
    }


    static #startReplaceEngine = () => {
      YoutubeSubtitlesSpeech.#engineEnabled = true

      let lastSegment

      const frame = () => {
        const playing = YoutubeSubtitlesSpeech.#$player && !YoutubeSubtitlesSpeech.#$player.paused

        if (playing && YoutubeSubtitlesSpeech.#segments?.length) {
          const currentTimeMs = YoutubeSubtitlesSpeech.#$player.currentTime * 1000 + 280

          const segment = YoutubeSubtitlesSpeech.#segments.find((s) => _NumberUtils.isNumberBetweenEquals(currentTimeMs, s.start, s.end))
          const text = segment?.text

          if (lastSegment !== segment) {
            lastSegment = segment

            const textNormalized = segment?.text.trim().toLowerCase().replace(/[sиы]$/, '')
            const translation = YoutubeSubtitlesSpeech.#dictionaryMap[textNormalized]

            if (translation) {
              console.log('speaking: ', text, ' as :', translation)
              YoutubeSubtitlesSpeech.utterThis2.speak(translation)
            }
          }
        }

        if (YoutubeSubtitlesSpeech.#engineEnabled) {
          requestAnimationFrame(frame)
        }
      }

      if (YoutubeSubtitlesSpeech.#engineEnabled) {
        requestAnimationFrame(frame)
      }
    }

    static #startCurseWordsReplaceEngine = () => {
      YoutubeSubtitlesSpeech.#engineEnabled = true

      let lastTime
      const CHUNK_SIZE_MS = 2000
      const frame = () => {
        const playing = YoutubeSubtitlesSpeech.#$player && !YoutubeSubtitlesSpeech.#$player.paused

        if (playing && YoutubeSubtitlesSpeech.#segments?.length) {
          const currentTimeMs = YoutubeSubtitlesSpeech.#$player.currentTime * 1000 + 280

          const now = performance.now()
          if (!lastTime || now - lastTime > CHUNK_SIZE_MS) {
            lastTime = now

            const segments = YoutubeSubtitlesSpeech.#segments.filter((s) => (_NumberUtils.isNumberBetweenEquals(s.start, currentTimeMs, currentTimeMs + CHUNK_SIZE_MS) && _NumberUtils.isNumberBetweenEquals(s.end, currentTimeMs, currentTimeMs + CHUNK_SIZE_MS)))
            const text = segments.map((s) => s.text).join(' ')

            const textCursified = _StringUtils.replaceRandomWord(text, _ArrayUtils.getRandomItem(CURSE_WORDS))
            YoutubeSubtitlesSpeech.utterThis2.speak(textCursified)
          }
        }

        if (YoutubeSubtitlesSpeech.#engineEnabled) {
          requestAnimationFrame(frame)
        }
      }

      if (YoutubeSubtitlesSpeech.#engineEnabled) {
        requestAnimationFrame(frame)
      }
    }

    static #stopReplaceEngine = () => {
      YoutubeSubtitlesSpeech.#engineEnabled = false
    }

    static #onNewVideoCaptionUrl = (captionUrl) => {
      YoutubeSubtitlesSpeech.#captionUrl = captionUrl
      YoutubeSubtitlesSpeech.#downloadCaptions()
    }

    static enable(dictionary) {
      if (dictionary) {
        YoutubeSubtitlesSpeech.setDictionary(dictionary)
      }

      if (!YoutubeSubtitlesSpeech.#enabled) {
        YoutubeSubtitlesSpeech.#enabled = true

        if (!YoutubeApiExposer.scriptInjected) {
          YoutubeApiExposer.inject()
          YoutubeApiExposer.listenForInjectedScript()
          // FIXME: Possible context loose
          YoutubeApiExposer.addNewVideoCaptionUrlListener(YoutubeSubtitlesSpeech.#onNewVideoCaptionUrl)
        }

        YoutubeSubtitlesSpeech.#startReplaceEngine()
      }
    }

    static disable() {
      if (YoutubeSubtitlesSpeech.#enabled) {
        YoutubeSubtitlesSpeech.#enabled = false

        if (YoutubeApiExposer.scriptInjected) {
          YoutubeApiExposer.removeListenerOfInjectedScript()
          YoutubeApiExposer.removeNewVideoCaptionUrlListener(YoutubeSubtitlesSpeech.#onNewVideoCaptionUrl)
        }

        YoutubeSubtitlesSpeech.#stopReplaceEngine()
      }
    }

    static setDictionary(dictionary) {
      YoutubeSubtitlesSpeech.#dictionaryMap = dictionary.reduce((acc, { original, translation }) => {
        acc[original] = translation
        return acc
      }, {})
    }

    static setLangs(langFrom, langTo) {
      YoutubeSubtitlesSpeech.#langFrom = langFrom
      YoutubeSubtitlesSpeech.#langTo = langTo
      YoutubeSubtitlesSpeech.utterThis2.setLang(langTo)
    }

    static setLangsWithUpdate(langFrom, langTo) {
      if (YoutubeSubtitlesSpeech.#langFrom !== langFrom || YoutubeSubtitlesSpeech.#langTo !== langTo) {
        YoutubeSubtitlesSpeech.setLangs(langFrom, langTo)

        YoutubeSubtitlesSpeech.#downloadCaptions()
      }
    }
  }

  class VideoSubtitlesReplacer extends _ReplacerUtils {
    static #enabled = false
    static #dictionary
    static #videoToTTChangeListener = new WeakMap()
    static #lastVideoReplacedTTs = new WeakMap()

    static #MutationObserver = window.MutationObserver || window.WebKitMutationObserver
    static #observer = new VideoSubtitlesReplacer.#MutationObserver(function (mutations) {
      // To prevent an infinite loop after replaced the text, because it'd be a mutation.
      // Thanks to https://github.com/marcioggs/text-changer-chrome-extension/blob/master/scripts/changeText.js#L61
      VideoSubtitlesReplacer.#stopObserving()

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.tagName === 'VIDEO') {
              VideoSubtitlesReplacer.#handleNewVideoNode(node)
            }
          }
        }
      })

      VideoSubtitlesReplacer.#startObserving()
    })

    static #startObserving = () => {
      VideoSubtitlesReplacer.#observer.observe(document.body, { subtree: true, childList: true, characterData: true, })
    }

    static #stopObserving = () => {
      VideoSubtitlesReplacer.#observer.disconnect()
    }

    static async #replaceInTTs(tts, $video) {
      VideoSubtitlesReplacer.#lastVideoReplacedTTs.set($video, tts)

      const ttArr = [...tts]

      for (const tt of ttArr) {
        const step = () => {
          if (tt.cues?.length) {
            [...tt.cues].forEach((cue, index, cues) => {
              const skip = VideoSubtitlesReplacer.hasSkipReplacingParent($video)
              if (skip) {
                return
              }

              for (const { original, translation } of VideoSubtitlesReplacer.#dictionary) {
                const regex = VideoSubtitlesReplacer.createMatchRegExp(original)
                const noReplace = VideoSubtitlesReplacer.hasNoReplaceParent($video)

                const className = noReplace ? 'pll-original' : 'pll-translation'
                const word = noReplace ? original : translation
                const prefix = `.${VideoSubtitlesReplacer.ALREADY_REPLACED_ATTR}><b>`

                if (!regex.test(cue.text)) {
                  continue
                }

                const textNew = cue.text.replace(regex, (matchStr, index, str) => {
                  const alreadyReplaced = str.slice(0, index).endsWith(prefix)
                  if (alreadyReplaced) {
                    return matchStr
                  }

                  return `<c.${className}${prefix}${word}</b></c>`
                })

                if (textNew === cue.text) {
                  continue
                }

                const newCue = new VTTCue(cue.startTime, cue.endTime, textNew)
                tt.addCue(newCue)

                const cueToRemove = cues.find((c) => c === cue)
                if (cueToRemove) {
                  tt.removeCue(cue)
                }
              }
            })
          }

          return !!tt.cues?.length
        }

        const resultOK = step()

        if (!resultOK) {
          let intervalMax = 10

          const intervalId = setInterval(() => {
            const stillActualTTs = VideoSubtitlesReplacer.#lastVideoReplacedTTs.get($video) === tts
            if (!stillActualTTs) {
              clearInterval(intervalId)
              return
            }

            intervalMax--

            const resultOK = step()

            if (intervalMax === 0 || resultOK) {
              clearInterval(intervalId)
            }
          }, 50)
        }
      }
    }

    static #replaceInTTsByVideo(video) {
      VideoSubtitlesReplacer.#replaceInTTs(video.textTracks, video)
    }


    static #createTTChangeListener($video) {
      return (event) => {
        const textTracks = event.currentTarget
        VideoSubtitlesReplacer.#replaceInTTs(textTracks, $video)
      }
    }

    static #removeListenTTChanges($video) {
      const listener = VideoSubtitlesReplacer.#videoToTTChangeListener.get($video)
      $video.textTracks.removeEventListener('change', listener)
    }

    static #listenTTChanges($video) {
      const listener = VideoSubtitlesReplacer.#createTTChangeListener($video)
      VideoSubtitlesReplacer.#videoToTTChangeListener.set($video, listener)
      $video.textTracks.addEventListener('change', listener)
    }


    static #handleNewVideoNode(video) {
      VideoSubtitlesReplacer.#listenTTChanges(video)
      // VideoSubtitlesReplacer.#replaceInTTsByVideo(video)
    }

    static #replace() {
      const $videos = document.querySelectorAll('video')
      $videos.forEach(VideoSubtitlesReplacer.#replaceInTTsByVideo)
    }

    static #setDictionary(dictionary) {
      VideoSubtitlesReplacer.#dictionary = dictionary
    }

    static setDictionaryAndReplace(dictionary) {
      VideoSubtitlesReplacer.#setDictionary(dictionary)
      VideoSubtitlesReplacer.#replace()
    }

    static enable(dictionary) {
      if (VideoSubtitlesReplacer.#enabled) {
        return
      }

      VideoSubtitlesReplacer.#enabled = true

      VideoSubtitlesReplacer.#setDictionary(dictionary)

      const $videos = document.querySelectorAll('video')
      $videos.forEach(VideoSubtitlesReplacer.#handleNewVideoNode)

      VideoSubtitlesReplacer.#startObserving()
    }

    static disable() {
      if (!VideoSubtitlesReplacer.#enabled) {
        return
      }

      VideoSubtitlesReplacer.#enabled = false

      // TODO: implement logic of putting replaced words back
      VideoSubtitlesReplacer.#removeListenTTChanges()
      VideoSubtitlesReplacer.#stopObserving()
    }
  }


  const isIgnoredOrigin = (ignoredOrigins) => ignoredOrigins.includes(CONSTANTS.clientInfo.origin)
  const isDisabled = (onboarded, disabledAtAll, ignoredOrigins) => !onboarded || disabledAtAll || isIgnoredOrigin(ignoredOrigins)
  const getAllFoldersEntries = (foldersEntries) => {
    return Object.values(foldersEntries).flat()
  }


  const stateManager = new Store('state', INITIAL_STATE, {
    version: '1.004',
  })

  const WordsReplacerUtterer = new Utterer({
    useVolumeLower: true,
    useMediaPauser: true,
    lang: 'en-US',
    rate: 0.7,
  })
  let lastState = await stateManager.load()

  const wordsReplacer = new DOMReplacer({
    dictionary: lastState.dictionary,
    skipRules: [(node) => node.id === Tooltip.tooltipId || (Toaster && node.id === Toaster.toasterId)],
    onWordReplaced: (node, { original }) => {
      node.addEventListener('mouseover', (e) => {
        const target = e.currentTarget

        if (lastState.config.pronounceWord) {
          if (!WordsReplacerUtterer.speaking()) {
            WordsReplacerUtterer.speak(e.currentTarget.textContent)
          }
        }

        // Tooltip
        const rect = target.getBoundingClientRect()
        Tooltip.show(original, rect.right - rect.width / 2, rect.top)
      })

      node.addEventListener('mouseout', () => {
        WordsReplacerUtterer.cancel()
        Tooltip.hide()
      })
    },
  })


  const handleLangsChanged = (langFrom, langTo) => {
    // YoutubeSubtitlesSpeech.setLangsWithUpdate(langFrom, langTo)
    WordsReplacerUtterer.setLang(langTo)
  }

  const handleDictionaryChange = (foldersEntries) => {
    const dictionary = getAllFoldersEntries(foldersEntries)

    wordsReplacer.setDictionaryAndReplace(dictionary)
    // YoutubeSubtitlesSpeech.setDictionary(dictionary)
    // VideoSubtitlesReplacer.setDictionaryAndReplace(dictionary)
  }

  const handleDisabledChanged = (onboarded, disabledAtAll, ignoredOrigins, foldersEntries, init) => {
    const disabledNew = isDisabled(onboarded, disabledAtAll, ignoredOrigins)

    if (disabledNew) {
      if (!init) {
        window.location.reload()
      }
    } else {
      const dictionary = getAllFoldersEntries(foldersEntries)

      wordsReplacer.enable(dictionary)
      YoutubeSubtitlesSpeech.enable(dictionary)
      VideoSubtitlesReplacer.enable(dictionary)
    }
  }

  const handleHighlightWordsChanged = (highlightWords) => {
    if (highlightWords) {
      _ReplacerUtils.makeHighlightColorful('#aeffb1', lastState.config.highlightTranslationBgColor, lastState.config.highlightTranslationColor)
    } else {
      _ReplacerUtils.makeHighlightTransparent()
    }
  }

  const handleHighlightTranslationBgColorChanged = (color) => {
    _ReplacerUtils.setHighlightTranslationBgColor(color)
  }

  const handleHighlightTranslationColorChanged = (color) => {
    _ReplacerUtils.setHighlightTranslationColor(color)
  }


  handleDisabledChanged(lastState.config.onboarded, lastState.config.disabledAtAll, lastState.config.ignoredOrigins, lastState.foldersEntries, true)
  handleLangsChanged(lastState.config.fromLang, lastState.config.toLang)
  handleHighlightTranslationBgColorChanged(lastState.config.highlightTranslationBgColor)
  handleHighlightTranslationColorChanged(lastState.config.highlightTranslationColor)
  handleHighlightWordsChanged(lastState.config.highlightWords)


  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.type) {
      case 'get-init-state-data': {
        sendResponse({ state: lastState, constants: CONSTANTS })
        break
      }
      case 'set-data': {
        const mutationRecord = message.data
        const { prop, value, path, deleteProperty } = mutationRecord

        const newState = lastState
        let target = newState
        for (const prop of path) {
          target = target[prop]
        }

        if (deleteProperty) {
          delete target[prop]
        } else {
          target[prop] = value
        }

        if (!deleteProperty) {
          switch (path[0]) {
            case 'config':
              switch (path[1]) {
                case 'ignoredOrigins':
                  handleDisabledChanged(newState.config.onboarded, newState.config.disabledAtAll, newState.config.ignoredOrigins, newState.foldersEntries)
                  break
              }

              switch (prop) {
                case 'fromLang':
                case 'toLang':
                  handleLangsChanged(newState.config.fromLang, newState.config.toLang)
                  break
                case 'disabledAtAll':
                case 'onboarded':
                  handleDisabledChanged(newState.config.onboarded, newState.config.disabledAtAll, newState.config.ignoredOrigins, newState.foldersEntries)
                  break
                case 'highlightWords':
                  handleHighlightWordsChanged(newState.config.highlightWords)
                  break
                case 'highlightTranslationBgColor':
                    handleHighlightTranslationBgColorChanged(newState.config.highlightTranslationBgColor)
                  break
                case 'highlightTranslationColor':
                    handleHighlightTranslationColorChanged(newState.config.highlightTranslationColor)
                  break
              }
              break
            case 'foldersEntries':
              handleDictionaryChange(newState.foldersEntries)
              break
          }
        }

        stateManager.save(newState)
        lastState = newState
        sendResponse(true)
        break
      }
      case 'add-word': {
        const { word } = message.data

        let wordTranslated
        if (Translator) {
          Toaster?.toast('Loading translation…')
          const translator = new Translator(lastState.config.fromLang, lastState.config.toLang)
          wordTranslated = await translator.getTranslation(word)
        }

        let newDictItem
        let translation

        while (true) {
          let translateMsg, reEnterMsg

          if (lastState.config.lang === 'uk') {
            translateMsg = `Будь ласка, введіть переклад слова "${word}"`
            reEnterMsg = 'Переклад такий самий, як слово. Будь ласка, введіть інший переклад. Готові?'
          } else if (lastState.config.lang === 'zh') {
            translateMsg = `请输入单词“${word}”的翻译`
            reEnterMsg = '翻译与单词相同。请输入其他翻译。准备好了吗？'
          } else {
            translateMsg = `Please, enter a translation for the word "${word}"`
            reEnterMsg = 'Translation is the same as the word. Please, enter a different translation. Re-enter?'
          }

          translation = prompt(translateMsg, wordTranslated)

          newDictItem = { original: word, translation, }

          if (translation.toLowerCase() === word.toLowerCase()) {
            const reEnter = confirm(reEnterMsg)

            if (!reEnter) {
              newDictItem = null
              translation = null
              break
            }
          } else {
            break
          }
        }

        if (translation) {
          const newState = lastState

          // Add folder
          const folderExists = newState.folders.some((f) => f.id === FOLDER_ID_SELECTION_WORDS)
          if (!folderExists) {
            const folder = {
              id: FOLDER_ID_SELECTION_WORDS,
              name: 'Слова, додані з опції в меню',
              entriesId: FOLDER_ID_SELECTION_WORDS,
            }

            newState.folders.push(folder)
          }

          // Add folder entry
          if (!newState.foldersEntries[FOLDER_ID_SELECTION_WORDS]) {
            newState.foldersEntries[FOLDER_ID_SELECTION_WORDS] = []
          }
          newState.foldersEntries[FOLDER_ID_SELECTION_WORDS].push(newDictItem)

          stateManager.save(newState)
          lastState = newState

          Toaster?.toast(`Word added ${word}: ${translation}!`)

          sendResponse(true)
        } else {
          sendResponse(false)
        }

        break
      }
    }
  })

  Tooltip.inject()
})()