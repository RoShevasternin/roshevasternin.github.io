# Звідки прийшли гравці — посилання з мітками, без нових SDK

Рішення власника 02.11.2026 (CubePix і Orbit Dash: «щоб з Firebase бачити, звідки прийшли юзери, бо ми даємо різні лінки для різних платформ»).
**Стандарт для всіх ігор студії.** Вставити в `CLAUDE.md` гри або дати сесії першим повідомленням.

**Обов'язково в кожній грі студії, з першого релізу (власник 02.11.2026): Firebase Analytics і бібліотека Install Referrer.** Власник може будь-коли спитати «звідки прийшли гравці й скільки їх», і Claude має показати це цифрами.

**Головне: Install Referrer уже працює сам.** Firebase Analytics сам читає його на Android і записує перше джерело гравця. Окремий код, окрема подія
з реферером чи платний сервіс атрибуції не потрібні. Бракує лише міток на наших посиланнях: без них установка записується як `(direct)`.

```markdown
## Звідки прийшли гравці (рішення власника 02.11.2026, правило студії docs/process/install-source.md)

У грі обов'язково є Firebase Analytics і `com.android.installreferrer:installreferrer`. Кожне наше посилання на гру несе мітку. Без мітки посилання не публікуємо.

**Власник питає «звідки прийшли гравці» чи «скільки їх» → Claude запускає звіт сам (`ga4.py sources 28d`, для більшого періоду `90d`) і показує таблицею: платформа, джерело, кампанія, нові гравці. Окремо каже, що `(direct)` — це посилання без мітки чи тестові установки, а iOS дивимось у App Store Connect. Звіт — частина правила: у новій грі він є разом із першим релізом.**

| де гравець відкриває | формат посилання | де видно |
|---|---|---|
| Google Play | `https://play.google.com/store/apps/details?id=<пакет>&referrer=utm_source%3D<джерело>%26utm_medium%3D<тип>%26utm_campaign%3D<кампанія>` | Firebase: `firstUserSource`, `firstUserMedium`, `firstUserCampaignName`; Play Console: Acquisition |
| App Store | `https://apps.apple.com/app/id<Apple ID>?ct=<кампанія>&pt=<provider token>` | **лише App Store Connect** → Analytics → Campaigns (від 5 перших завантажень, через ≥ 24 год) |
| сайт гри, веб-гра | `<сайт>?utm_source=<джерело>&utm_medium=<тип>&utm_campaign=<кампанія>` | Firebase, веб-потік, лише після «Дозволити» в банері згоди |

Значення `referrer` закодоване: `=` → `%3D`, `&` → `%26`. Лише прямі посилання `play.google.com`: скорочувачі й редиректи можуть загубити мітку.

Мітки — малими літерами, латиницею, однакові в усіх іграх:
| звідки | utm_source | utm_medium | utm_campaign / ct |
|---|---|---|---|
| кнопка «Поділитися грою» | `share` | `player` | `share_android`, `share_ios`, `share_web` — де натиснули |
| кнопка «Поділитися картиною» | `share` | `player` | `share_picture_android`, `share_picture_ios`, `share_picture_web` |
| сайт гри | `site` | `game_site` | |
| сайт студії Lewydo | `lewydo` | `studio_site` | |
| мережі студії | `instagram`, `facebook`, `x`, `discord`, `tiktok`… | `bio`, `page`, `post`, `video` | назва допису чи свята |
| відео: опис, закріплений коментар, картка, біо під відео | `youtube`, `tiktok`, `instagram`, `facebook`… | `video` | назва відео, наприклад `halloween_shorts` |
| реклама | мережа | `paid` | назва кампанії |

**Відео (власник 02.11.2026):** робимо відео, у якому є посилання, — посилання лише з міткою, окрема кампанія на кожне відео й платформу. Тоді видно, яке саме відео привело гравців. Це стосується й готових текстів до відео, які віддаємо власнику. Лінк на сайт гри теж із міткою: сайт передасть її в Google Play. Якщо мережа не дає клікабельних посилань у дописі (TikTok), мітка йде в посилання в біо.

**Сторінка студії (власник 03.11.2026, завжди):** кожне посилання зі сторінки студії на гру несе `utm_source=lewydo&utm_medium=studio_site`: сайт гри, веб-гра, картка свята, кнопка магазину. Це стосується кожної гри й кожної нової кнопки чи картки, у тій самій задачі, що й сама кнопка. Без мітки ці гравці у звіті виглядають як `(direct)`, і внесок студії не видно. Як зроблено для Orbit Dash: `mark` у `src/games.json`, посилання — через `odLink` у `tools/build.mjs`; `site` і `demo` лишаються чистими шляхами, бо з них будуються шляхи картинок; `src/lang.js` додає `lang` через `&`, якщо запит уже є. Без мітки лишаються політика приватності, картинки й кадр живої гри (`embed`): у кадрі аналітики немає.

Сайт гри передає мітки далі: хто прийшов на сайт із `utm_*`, у того кнопка Google Play несе ті самі мітки в `referrer`; без них — мітка самого сайту.

**Android:** бібліотека `com.android.installreferrer:installreferrer` уже потрібна TikTok, Firebase читає реферер сам. Свого коду немає.
**iOS:** App Store не передає застосунку жодного реферера, тож перше джерело в Firebase на iOS майже завжди `(direct)`. Це не помилка, і лагодити її
не треба. Міряємо кампаніями Apple (`ct` + `pt`, пише App Store Connect). Provider token один на акаунт розробника, власник бере його в App Store
Connect → Analytics → Campaigns; без нього `ct` не додаємо. Поки гри немає в App Store, з iPhone ведемо на сайт гри з міткою `share_ios`.
**Не робимо:** відбитки пристрою, буфер обміну для відкладеного посилання, платні SDK (AppsFlyer, Adjust) — поки немає платної реклами в обсягах, де вони окупаються.

Аналіз: `ga4.py sources [період]` (нові гравці за платформою, джерелом і кампанією; залученість за джерелом; сесії сайту; тапи `share_game`).
`(direct)` на Android — посилання без мітки, установка не з Play (наші тести через adb) або сторінка, відкрита без реферера.

Перевірка мітки: її видно лише на справжній установці з Play, тому нове посилання дивимось у звіті за кілька днів. Сторінка Play з `referrer` має відкриватись як звичайно (код 200, той самий заголовок).
```

## Чому так (що перевірено 02.11.2026)
- Google: SDK Firebase на Android включає Play Install Referrer API, а джерело `(direct)` означає посилання на Play без реферера ([як GA4 рахує установки](https://support.google.com/analytics/answer/10311900), [налаштування](https://support.google.com/analytics/answer/9353532)).
- Google: на iOS автотеги для установок не працюють; є лише Universal Links для вже встановленої гри, Apple Search Ads і ручна подія `campaign_details`. Ручну подію не беремо: на iOS джерела взяти нема звідки.
- Apple: `ct` — кампанія, `pt` — акаунт розробника; кампанії видно від 5 перших завантажень, завантаження зараховують протягом 24 год після посилання ([Apple](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)).
- Дані CubePix за жовтень 2026: 59 із 72 нових гравців на Android — `(direct)`, 13 — `google-play / organic`. Реферер працює, не вистачало міток (частина `(direct)` — наші тестові установки).

## Як це зроблено в іграх
- **CubePix:** `shareLink`, `shareUtm`, `APPSTORE_PT` у `cubepix-prototype/src/CubePix.jsx`; кнопка сайту — `scripts/build-site.mjs`, передача міток — `site/index.html`; гра — патч 73; звіт — `cubepix-libgdx/tools/firebase/ga4.py sources`.
- **Orbit Dash:** патч 302. Логіка міток і білий список чужого вводу — `prototype/marks.mjs` (той самий файл бере веб-гра, а `site/build.py` вшиває його в `site/src/page.js`); посилання кнопки — `prototype/share.mjs` (`shareUtm`, `APPSTORE_PT`) і `ShareRules.kt`; перевірка в Chrome — `site/tools/sharecheck.cjs`; звіт — `Orbit Dash/docs/lab/analytics/ga4.py sources`.
- **Сайт студії:** `mark` у `src/games.json`, `odLink` і `cpLink` у `tools/build.mjs` (лише для `href`: `site` будує й шляхи картинок), тест «every link to a game carries the studio mark»; `src/lang.js` додає `lang` через `&`, якір лишається в кінці.
- **Нова гра:** Firebase Analytics, бібліотека, мітки й звіт `ga4.py sources` — з першого релізу.
- **Старі ігри без Firebase (02.11.2026):** Uxo Monaxa, Physical Light, Joints Tutorials: у файлах збірки Firebase Analytics і бібліотеки немає; Idle Merge Cubes — вони є, але в теці немає `google-services.json`. Додаємо, коли власник скаже; до того там лише звіт Play Console.
