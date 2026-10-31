# TikTok у грі — Android і iOS однаково, в усіх іграх студії

Власник 31.10.2026: «TikTok зараз тільки для Android, а вийде iOS — там теж має бути TikTok SDK… напишеш сесії CubePix, щоб реалізувала
TikTok як ти, і для iOS, і щоб параметри Remote Config для TikTok були однакові — це треба записати в репо студії, щоб усі робили так».
Еталон — Orbit Dash, патч 289 (`Orbit Dash/docs/patches/289-tiktok-ios.md` у приватному репо гри). Схема Remote Config — `remote-config.md`
поруч.

## 1. Ключі — блок `tiktok` у параметрі своєї платформи, однаково в усіх іграх

```json
android  { "tiktok": { "app_id": "<TikTok App ID Android>[,<ще один>]", "secret": "<App secret Android>" } }
ios      { "tiktok": { "app_id": "<TikTok App ID iOS>", "secret": "<App secret iOS>" }, "update": { … } }
config   { "tiktok": { …копія android.tiktok… } }      ← СТАРЕ, лише для вже випущених Android; копію тримає інструмент
```

- **`android.tiktok` — Android**, **`ios.tiktok` — iPhone**: в Events Manager iOS — окремий застосунок зі своїм TikTok App ID і секретом (App
  Store ID гри — там же). Розкладка параметрів, порядок переходу й копія для старих збірок — `remote-config.md`.
- Нова збірка Android: `android.tiktok`, а поки бойовий конфіг не розкладено — верхній `tiktok` старого `config`. iPhone — **лише**
  `ios.tiktok` (верхній `config.tiktok` — ключі Android, iPhone їх не бере ніколи).
- Значення — **лише рядки** (19-значний App ID числом JSON спотворюється). Кілька App ID — через кому.
- Немає / порожньо / зламано — SDK на цій платформі **не стартує, тихо** (без помилок, без падінь). Гра виходить без ключів iOS — це норма:
  власник дає їх, коли iOS вийде, і iPhone бере їх зі свіжого Remote Config **без нової збірки**.
- **Запис** — інструментом гри (Orbit Dash: `docs/lab/analytics/rc.py tiktok android|ios <App ID> [--dry]`): пише лише блок цієї платформи
  (Android — і копію в старий `config`), решта — байт у байт; секрет — не аргументом (історія shell, журнал), а прихованим запитом або stdin;
  у виводі — лише довжина. Спершу `--dry`; запис у бойовий Remote Config — **лише з «так» власника**. Найкраще — власник запускає сам (`!`),
  тоді секрет не йде в чат.

## 2. Події — ті самі на обох платформах, з тих самих моментів

TikTok — не продуктова аналітика, а сигнали для алгоритму закупівлі. Шлемо **лише стандартні події** TikTok (імена Events Manager однакові
в Android `EventName` і iOS `TTEventName*`):

| подія | коли (своє для кожної гри — але однаково на Android і iOS) |
|---|---|
| `CompleteTutorial` | туторіал пройдено |
| `AchieveLevel` | гравець виріс: новий рекорд / перший прохід рівня |
| `UnlockAchievement` | досягнення: корона, місія, нагорода |
| `SpendCredits` | витратив внутрішню валюту |

`InstallApp`, `LaunchAPP`, `2Dretention` і облік покупок — **автоподії SDK, типові налаштування** на обох платформах (нічого не вимикаємо й
не вмикаємо руками). Решту подій гри в TikTok не шлемо — шум погіршує оптимізацію кампаній.

**Як тримати однаковість:** мапа «подія гри → подія TikTok» — **один клас у спільному коді** (Orbit Dash: `:core`
`services/analytics/TikTokSignals` — `AnalyticsProvider` з абстрактним `track(event)`), платформи — лише доставка (Android
`TikTokAnalyticsProvider` → `TikTokBusinessSdk.trackTTEvent`, iOS `IOSTikTokProvider` → `TikTokBusiness trackTTEvent:`). Тест на JVM — які
події з яких викликів; тест Android — `EventName.toString()` = імена iOS.

## 3. Згода — та сама на Android, на iOS ще й ATT

- **Android:** SDK стартує, лише коли є ключі **і** згода (`ConsentRules.tiktokAllowed`): GDPR діє — TCF мета 1 і вендор TikTok **986**;
  штати США — без opt-out (GPP / US Privacy); GDPR не діє — так; UMP ще не відповів — чекаємо. Згоду забрали посеред сесії (PRIVACY
  OPTIONS) — глобальний вимикач SDK, наш провайдер мовчить.
- **iOS:** те саме правило **і ATT «Allow»** — події для вимірювання реклами в чужій мережі — це «відстеження» за Apple (App Review 5.1.2);
  «Ask App Not to Track» / обмежено — SDK не стартує зовсім. ATT питає **гра** (після форми UMP, як для реклами), SDK TikTok 1.7+ вікна сам не
  показує. Кожна зміна згоди чи ATT (форма, PRIVACY OPTIONS, повернення з Параметрів iOS) — перевірити знову; забрали — `setTrackingEnabled:NO`.
- Нічого TikTok **до** згоди: SDK на старті сам шле `LaunchAPP` / `InstallApp`.

## 4. Debug — тестовий потік за прапорцем лабораторії

Debug-збірка **без прапорця SDK не стартує** (запуски власника й лабораторії не змішуються з гравцями кампаній). З прапорцем — тестовий
режим SDK (Android `openDebugMode()`, iOS `enableDebugMode`) і його журнал: події видно в Events Manager → застосунок → **Test event**, у
звіти й оптимізацію не йдуть. Orbit Dash: Android `adb shell setprop debug.od.tiktok 1`, iOS `OD_PROPS="tiktok=1"` (`@setprop tiktok 1`).

## 5. SDK на iOS (libGDX / RoboVM) — як підключено в Orbit Dash

- **SDK:** TikTok Business SDK iOS, останній стабільний (31.10.2026 — **1.7.2**), статичний `TikTokBusinessSDK.xcframework.zip` з релізу
  `github.com/tiktok/tiktok-business-ios-sdk` (частково Swift — `swiftSupport` у `robovm.xml`). Качає й звіряє sha256 збірка (TikTok сум не
  публікує — наш замір першого завантаження в `SHA256SUMS`), розпаковує лише зрізи iPhone і симулятора.
- **Біндинг — свій** (altpods TikTok не має), Java, три класи рівно на селектори гри: `TikTokConfig` (`configWithAccessToken:appId:tiktokAppId:`
  — accessToken = секрет, appId = **Apple ID гри**, tiktokAppId = TikTok App ID; `enableDebugMode`; `setLogLevel:`), `TikTokBusiness`
  (`initializeSdk:completionHandler:`, `trackTTEvent:`, `setTrackingEnabled:`, `isInitialized`, `getSDKVersion`), `TikTokBaseEvent`
  (`eventWithName:`). Нова версія SDK — звірити заголовки з біндингом.
- **`robovm.xml`:** `<framework>TikTokBusinessSDK</framework>`, шлях — до розпакованих xcframework; системні фреймворки SDK лінкер бере сам.
- **Маніфест приватності:** `PrivacyInfo.xcprivacy` із фреймворка — у бандл як `TikTokBusinessSDK_Privacy.bundle` (ім'я з podspec TikTok):
  статичні фреймворки RoboVM лише лінкує.
- **SKAdNetwork:** `22mmun2rn5.skadnetwork`, `238da6jt44.skadnetwork` — в `Info.plist` завжди.
- **Remote Config на iOS** — REST `firebase:fetch` без SDK (`remote-config.md`): свіжий параметр `ios` → перевірити ключі TikTok знову (ключі з'явились
  — SDK стартує в цьому ж процесі; вже стартований — до кінця процесу з тими, з якими стартував).

## 6. Перевірка перед злиттям

- тести парсера на фікстурі розкладки (`remote-config.md`): лише старий `config`, розкладене, нове перекриває старе, ключі iOS до migrate,
  `ios.tiktok` немає / `{}` / порожні рядки / без секрету / App ID числом / не JSON; iPhone ніколи не бере `config.tiktok`; і як читають
  випущені Android (лише старий `config` — копія на місці);
- тест мапи подій і правила згоди iOS (ATT × GDPR);
- збірка iOS, симулятор чи iPhone **без ключів**: SDK не стартує, гра не падає, у журналі — один рядок «ключів немає»;
- з тестовими ключами (якщо власник дав) і прапорцем debug — подія в Events Manager → Test event.

## Готовий промпт для сесії гри

> Розклади Remote Config гри на параметри `shared` / `android` / `ios` і додай TikTok Business SDK на iOS — за правилами студії
> `docs/process/remote-config.md` і `docs/process/tiktok.md` (репо RoShevasternin/roshevasternin.github.io). Гра читає `shared` + свій
> параметр, кожен блок — з нового параметра, інакше зі старого місця в `config` (старий `config` лишається копією для вже випущених збірок —
> не ламати їх). TikTok: Android — `android.tiktok` (запас — верхній `config.tiktok`), iPhone — лише `ios.tiktok`; без ключів SDK не стартує,
> тихо. Події — ті самі чотири стандартні з тих самих моментів на обох платформах (одна мапа в спільному коді), згода — правило Android (TCF
> мета 1 + вендор 986, US opt-out) і на iOS ще ATT «Allow»; debug — тестовий потік лише за прапорцем лабораторії. Інструмент: `layout`,
> `migrate`, `tiktok android|ios` з маскуванням секрету (секрет — не аргументом), копію в `config` тримає сам; запис у бойовий Remote Config —
> лише з «так» власника, `migrate` — після виходу оновлення. Еталон — Orbit Dash, патч 289.
