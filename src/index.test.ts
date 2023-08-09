import { normalize } from './index'
import { assert, describe, it } from 'vitest'

interface Test {
  text: string
  expected: string
  name?: string
}

interface Suite {
  name: string
  tests: Test[]
}

const suites: Suite[] = [
  {
    name: 'test cases from https://github.com/mplatt/fold-to-ascii',
    tests: [
      {
        text: 'Lorem ipsum dôlor sit amêt, pri at cetèro ëripuît inérmis.',
        expected: 'Lorem ipsum dolor sit amet, pri at cetero eripuit inermis.',
      },
      {
        text: "Lorem 🤧😇 Ipsum",
        expected: 'Lorem 🤧😇 Ipsum',
      },

      // these 2 tests are NOT the same!
      {
        text: "お早うございます",
        expected: 'お早うございます',
      },
      {
        text: "お早うございます",
        expected: 'お早うございます',
      },
    ],
  },
  {
    name: 'test cases from https://github.com/andrewrk/node-diacritics',
    tests: [
      // adjusted for cyrillic
      {
        text: 'INｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ',
        expected: "INternationalizati0n",
      },
      // adjusted ð => d (instead of dh)
      // adjusted ѕ => s U+0073 (instead of staying ѕ U+0455)
      // adjusted for cyrillic
      {
        text: "Båｃòл íｐѕùｍ ðｏɭ߀ｒ ѕïｔ ａϻèｔ âùþê ａԉᏧ߀üïｌɭê ƃëéｆ ｃｕｌρá ｆïｌèｔ ϻｉǥｎòｎ ｃｕρｉᏧａｔａｔ ｕｔ êлｉｍ ｔòлɢùê.",
        expected: "Bacol ipsum dol0r sit aMet authe and0ueille beef culpa filet Mignon cupidatat ut elim tolGue.",
      },
      {
        text: "ᴎᴑᴅᴇȷʂ",
        expected: "NoDEJs",
      },
      {
        text: "hambúrguer",
        expected: "hamburguer",
      },
      {
        text: "hŒllœ",
        expected: "hOElloe",
      },
      {
        text: "Fußball",
        expected: "Fussball",
      },
      {
        text: "ABCDEFGHIJKLMNOPQRSTUVWXYZé",
        expected: "ABCDEFGHIJKLMNOPQRSTUVWXYZe",
      },
    ],
  },
  {
    name: 'test cases from https://github.com/VitorLuizC/normalize-text',
    tests: [
      // adjusted for umlauts
      {
        text: 'àáãâäéèêëíìîïóòõôöúùûüñçÀÁÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÑÇ',
        expected: 'aaaaaeeeeeiiiioooooeuuuuencAAAAAeEEEEIIIIOOOOOeUUUUeNC',
      },
      {
        text: '@_$><=-#!,.`\'"',
        expected: '@_$><=-#!,.`\'"',
      },
      {
        text: 'ß',
        expected: 'ss',
      },
      {
        text: 'moça, então é você que está',
        expected: 'moca, entao e voce que esta',
      }
    ],
  },
  {
    name: 'test cases from https://github.com/tyxla/remove-accents',
    tests: [
      // adjusted Ł => L (instad of l)
      // adjusted Þ => Th (instead of TH)
      // adjusted for umlauts Ä Ö Ü ä ö ü => Ae Oe Ue ae oe ue
      {
        text: 'ÀÁÂÃÄÅẤẮÆẦẰÇḈÈÉÊËẾḖỀḔÌÍÎÏḮÐÑÒÓÔÕÖØỐṌṒÙÚÛÜÝàáâãäåấắæầằçḉèéêëếḗềḕìíîïḯñòóôõöøốṍṓùúûüýÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģǴǵĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķḰḱĹĺĻļĽľĿŀŁłḾḿŃńŅņŇňŉŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵẂẃŶŷŸŹźŻżŽžſƒƠơƯưǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜỨứṸṹǺǻǼǽǾǿðÞþṔṕṤṥX́x́ЃѓЌќA̋a̋E̋e̋I̋i̋ǸǹỒồṐṑỪừẀẁỲỳȀȁȄȅȈȉȌȍȐȑȔȕẲẴẶḜẳẵặḝC̆c̆ḪḫK̆k̆M̆m̆N̆n̆P̆p̆R̆r̆T̆t̆V̆v̆X̆x̆Y̆y̆ȂȆȊȎȃȇȋȏȒȓȖȗșțȘȚB̌b̌F̌f̌ǦǧȞȟJ̌ǰǨǩM̌m̌P̌p̌Q̌q̌ṦṧV̌v̌W̌w̌X̌x̌Y̌y̌A̧a̧B̧b̧ḐḑȨȩƐ̧ɛ̧ḨḩI̧i̧Ɨ̧ɨ̧M̧m̧O̧o̧Q̧q̧U̧u̧X̧x̧Z̧z̧ß',
        expected: 'AAAAAeAAAAEAACCEEEEEEEEIIIIIDNOOOOOeOOOOUUUUeYaaaaaeaaaaeaacceeeeeeeeiiiiinoooooeoooouuuueyyAaAaAaCcCcCcCcDdDdEeEeEeEeEeGgGgGgGgGgHhHhIiIiIiIiIiIJijJjKkKkLlLlLlLlLlMmNnNnNnnOoOoOoOEoeRrRrRrSsSsSsSsTtTtTtUuUuUuUuUuUuWwWwYyYZzZzZzsfOoUuAaIiOoUuUuUuUuUuUuUuAaAEaeOodThthPpSsXxГгКкAaEeIiNnOoOoUuWwYyAaEeIiOoRrUuAAAEaaaeCcHhKkMmNnPpRrTtVvXxYyAEIOaeioRrUustSTBbFfGgHhJjKkMmPpQqSsVvWwXxYyAaBbDdEeEeHhIiIiMmOoQqUuXxZzss',
      },
      // adjusted for cyrillic
      {
        text: 'ЁёЙй',
        expected: 'YoyoIi',
      },
      // adjusted for cyrillic
      {
        text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789.,:;~`!@#$%^&*()-_=+[]{}\'"|\\<>?/eEиИ',
        expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789.,:;~`!@#$%^&*()-_=+[]{}\'"|\\<>?/eEiI',
      },
      {
        text: 'cat',
        expected: 'cat',
      },
      {
        text: 'Pokémon',
        expected: 'Pokemon',
      },
      {
        text: 'Straße',
        expected: 'Strasse',
      },
    ],
  },
  {
    name: 'own tests',
    tests: [
      {
        text: 'Жопа',
        expected: 'Zhopa',
      },
      {
        text: 'Pokémon are tHe bḖSt 2023!',
        expected: 'Pokemon are tHe bESt 2023!',
      },
      {
        text: 'mUltįįįį----- slug! 111',
        expected: 'mUltiiii----- slug! 111',
      },
    ],
  },
  {
    name: 'test cases from some doc',
    tests: [
      {
        text: 'Xiaomi plant Produktfeuerwerk: Neue Smartphones, Tablets und Kopfhörer',
        expected: 'Xiaomi plant Produktfeuerwerk: Neue Smartphones, Tablets und Kopfhoerer',
      },
      {
        text: 'MediaMarkt Tarifwelt: Mega Samsung-Bundles & bis zu 700 € geschenkt',
        expected: 'MediaMarkt Tarifwelt: Mega Samsung-Bundles & bis zu 700 € geschenkt',
      },
      {
        text: 'MediaMarkt Outlet: Restposten mit bis zu 70 % Rabatt – wie gut sind die Angebote?',
        expected: 'MediaMarkt Outlet: Restposten mit bis zu 70 % Rabatt – wie gut sind die Angebote?',
      },
      {
        text: 'Netflix Top 10: Die beliebtesten Serien und Filme am 16. September 2022',
        expected: 'Netflix Top 10: Die beliebtesten Serien und Filme am 16. September 2022',
      },
      {
        text: 'GZSZ-Vorschau (19.09. – 23.09.): Verknallt in Jessi! Macht Jonas jetzt Tuner Konkurrenz?',
        expected: 'GZSZ-Vorschau (19.09. – 23.09.): Verknallt in Jessi! Macht Jonas jetzt Tuner Konkurrenz?',
      },
      {
        text: 'Kunstraub bei GZSZ? John will 1,5 Millionen Euro teures Bild stehlen',
        expected: 'Kunstraub bei GZSZ? John will 1,5 Millionen Euro teures Bild stehlen',
      },
      {
        text: '- Achtung Kontrolle - ',
        expected: '- Achtung Kontrolle - ',
      },
      {
        text: 'Ist das eine Frage? - Vermutlich ja!',
        expected: 'Ist das eine Frage? - Vermutlich ja!',
      },
    ]
  },
  {
    name: 'remove-accents.ts',
    tests: [
      {
        text: 'ЁЙЦУКЕНГШЩЗХЪёйцукенгшщзхъФЫВАПРОЛДЖЭфывапролджэЯЧСМИТЬБЮячсмитьбю',
        expected: 'YoITSUKENGShSchZH\'yoitsukengshschzh\'FIVАPROLDZhEfivaproldzheYaChSMIT\'BYuyachsmit\'byu',
      },
      {
        text: 'ÀÁÂÃÄÅẤẮẲẴẶÆẦẰȂÇḈÈÉÊËẾḖỀḔḜȆÌÍÎÏḮȊÐÑÒÓÔÕÖØỐṌṒȎÙÚÛÜÝàáâãäåấắẳẵặæầằȃçḉèéêëếḗềḕḝȇìíîïḯȋðñòóôõöøốṍṓȏùúûüýÿĀāĂăĄą',
        expected: 'AAAAAeAAAAAAAEAAACCEEEEEEEEEEIIIIIIDNOOOOOeOOOOOUUUUeYaaaaaeaaaaaaaeaaacceeeeeeeeeeiiiiiidnoooooeooooouuuueyyAaAaAa',
      },
      {
        text: 'ĆćĈĉĊċČčC̆c̆ĎďĐđĒēĔĕĖėĘęĚěĜǴĝǵĞğĠġĢģĤĥĦħḪḫĨĩĪīĬĭĮįİıĲĳĴĵĶķḰḱK̆k̆ĹĺĻļĽľĿŀŁłḾḿM̆m̆ŃńŅņŇňŉN̆n̆ŌōŎŏŐőŒœP̆p̆ŔŕŖŗŘřR̆r̆ȒȓŚśŜŝŞȘșşŠšß',
        expected: 'CcCcCcCcCcDdDdEeEeEeEeEeGGggGgGgGgHhHhHhIiIiIiIiIiIJijJjKkKkKkLlLlLlLlLlMmMmNnNnNnnNnOoOoOoOEoePpRrRrRrRrRrSsSsSSssSsss',
      },
      {
        text: 'ŢţțȚŤťŦŧT̆t̆ŨũŪūŬŭŮůŰűŲųȖȗV̆v̆ŴŵẂẃX̆x̆ŶŷŸY̆y̆ŹźŻżŽžſƒƠơƯưǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜỨứṸṹǺǻǼǽǾǿÞþṔṕṤṥX́x́ЃѓЌќA̋a̋E̋e̋I̋i̋ǸǹỒồṐṑỪừẀẁỲỳ',
        expected: 'TttTTtTtTtUuUuUuUuUuUuUuVvWwWwXxYyYYyZzZzZzsfOoUuAaIiOoUuUuUuUuUuUuUuAaAEaeOoThthPpSsXxГгКкAaEeIiNnOoOoUuWwYy',
      },
      {
        text: 'ȀȁȄȅȈȉȌȍȐȑȔȕB̌b̌Č̣č̣Ê̌ê̌F̌f̌ǦǧȞȟJ̌ǰǨǩM̌m̌P̌p̌Q̌q̌Ř̩ř̩ṦṧV̌v̌W̌w̌X̌x̌Y̌y̌A̧a̧B̧b̧ḐḑȨȩƐ̧ɛ̧ḨḩI̧i̧Ɨ̧ɨ̧M̧m̧O̧o̧Q̧q̧U̧u̧X̧x̧Z̧z̧',
        expected: 'AaEeIiOoRrUuBbCcEeFfGgHhJjKkMmPpQqRrSsVvWwXxYyAaBbDdEeEeHhIiIiMmOoQqUuXxZz',
      },
    ],
  },
]

const aestheticTests = [
  // https://www.aesthetictext.net
  {
    name: 'old english',
    text: '𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ1234567890',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'medieval',
    text: '𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅1234567890',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'cursive',
    text: '𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩1234567890',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'scriptify',
    text: '𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫𝟢',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'double struck',
    text: '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡𝟘',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'italic',
    text: '𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡1234567890',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'bold italic',
    text: '𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕1234567890',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'mono space',
    text: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿𝟶',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'lumitools bubbles',
    text: 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ①②③④⑤⑥⑦⑧⑨⓪',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'inverted squares',
    text: '🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉1234567890',
    expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'fat text',
    text: 'ᗩᗷᑕᗪᗴᖴǤᕼᎥᒎᛕᒪᗰᑎᗝᑭɊᖇᔕ丅ᑌᐯᗯ᙭Ƴ乙ᗩᗷᑕᗪᗴᖴǤᕼᎥᒎᛕᒪᗰᑎᗝᑭɊᖇᔕ丅ᑌᐯᗯ᙭Ƴ乙1234567890',
    expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'widetext',
    text: 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ１２３４５６７８９０',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'bold',
    text: '𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗𝟎',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'squares',
    text: '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉1234567890',
    expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },

  // https://www.aestheticfonts.net
  {
    name: 'aesthetic 6',
    text: 'a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶1234567890',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'aesthetic 7',
    text: 'a̲̅b̲̅c̲̅d̲̅e̲̅f̲̅g̲̅h̲̅i̲̅j̲̅k̲̅l̲̅m̲̅n̲̅o̲̅p̲̅q̲̅r̲̅s̲̅t̲̅u̲̅v̲̅w̲̅x̲̅y̲̅z̲̅A̲̅B̲̅C̲̅D̲̅E̲̅F̲̅G̲̅H̲̅I̲̅J̲̅K̲̅L̲̅M̲̅N̲̅O̲̅P̲̅Q̲̅R̲̅S̲̅T̲̅U̲̅V̲̅W̲̅X̲̅Y̲̅Z̲̅1234567890',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'aesthetic 12',
    text: 'ƛƁƇƊЄƑƓӇƖʆƘԼMƝƠƤƢƦƧƬƲƔƜҲƳȤƛƁƇƊЄƑƓӇƖʆƘԼMƝƠƤƢƦƧƬƲƔƜҲƳȤ1234567890',
    expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'aesthetic 17',
    text: 'aͦbͦcͦdͦeͦfͦgͦhͦiͦjͦkͦlͦmͦnͦoͦpͦqͦrͦsͦtͦuͦvͦwͦxͦyͦzͦAͦBͦCͦDͦEͦFͦGͦHͦIͦJͦKͦLͦMͦNͦOͦPͦQͦRͦSͦTͦUͦVͦWͦXͦYͦZͦ1234567890',
    expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'aesthetic 20',
    text: 'ä̤b̤̈c̤̈d̤̈ë̤f̤̈g̤̈ḧ̤ï̤j̤̈k̤̈l̤̈m̤̈n̤̈ö̤p̤̈q̤̈r̤̈s̤̈ẗ̤ṳ̈v̤̈ẅ̤ẍ̤ÿ̤z̤̈1234567890',
    expected: 'abcdefghijklmnopqrstuvwxyz1234567890',
  },
  {
    name: 'squiggle symbols',
    text: 'ꋫꃃꏸꁕꍟꄘꁍꑛꂑꀭꀗ꒒ꁒꁹꆂꉣꁸ꒓ꌚ꓅ꐇꏝꅐꇓꐟꁴꋫꃃꏸꁕꍟꄘꁍꑛꂑꀭꀗ꒒ꁒꁹꆂꉣꁸ꒓ꌚ꓅ꐇꏝꅐꇓꐟꁴ1234567890',
    expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'squiggle symbols',
    text: 'ꍏꌃꉓꀸꍟꎇꁅꃅꀤꀭꀘ꒒ꂵꈤꂦꉣꆰꋪꌗ꓄ꀎꃴꅏꊼꌩꁴꍏꌃꉓꀸꍟꎇꁅꃅꀤꀭꀘ꒒ꂵꈤꂦꉣꆰꋪꌗ꓄ꀎꃴꅏꊼꌩꁴ1234567890',
    expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
  {
    name: 'squiggle symbols',
    text: 'ᎯᏰᏨᎠᎬᎰᎶᎻᎨᏠᏦᏝᎷᏁᎾᏢᏅᏒᏕᎿᏬᏉᏯᎲᎽᏃᎯᏰᏨᎠᎬᎰᎶᎻᎨᏠᏦᏝᎷᏁᎾᏢᏅᏒᏕᎿᏬᏉᏯᎲᎽᏃ1234567890',
    expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
  },
]

// combine all
suites.push({
  name: '"aesthetic" text',
  tests: [
    {
      text: aestheticTests.map(test => `${test.name} ${test.text}`).join('\n'),
      expected: aestheticTests.map(test => `${test.name} ${test.expected}`).join('\n'),
    }
  ],
})

suites.forEach(suite => {
  describe(suite.name, () => {
    suite.tests.forEach(test => {
      it(`normalize works ${test.name || ''}`, () => {
        assert.equal(normalize(test.text), test.expected)
      })
    })
  })
})
