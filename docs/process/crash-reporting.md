# Падіння гравців — видно в Crashlytics, Android і iOS, у кожній грі студії

Рішення власника 20.11.2026 (Orbit Dash): «передай це виправлення і CubePix, що б там на iOS теж все якісно працювало і в Crashlytics все
бачили, і запиши це правило в репо студії, що б більше не було таких багів».
**Стандарт для всіх ігор студії.** Вставити в `CLAUDE.md` гри (готовий промпт — нижче) або дати сесії гри першим повідомленням.

## Навіщо — що сталося в Orbit Dash

- Firebase Crashlytics на iOS стояв з першого релізу, і звіти падінь **доходили**, але без **dSYM** (символи збірки) Firebase їх не обробляв:
  у Firebase → Crashlytics → dSYMs вони висіли «Missing (required)». Падінь iOS ми просто не бачили — 3.0.1 і 3.3.0.
- Через це тижнями не бачили головного бага iOS: **на iOS 15–17 падав будь-який рівень** — `-[AVAudioFile close]: unrecognized selector`
  (метод є лише з iOS 18, а гра — з iOS 15). Гравці писали у відгуках («Quand j’essaye de lancer un niveau, ça me fait crash l’appli…»).
- Виправлення: Orbit Dash, патчі **454** (dSYM у Crashlytics сам, з кожною збіркою App Store; 3.3.0 відновлено заднім числом) і **456**
  (виклики API новіших за мінімальну iOS — лише з перевіркою; сканер і тест-сторож). Перевірено на справжній iOS 17.5 (симулятор): до — падіння,
  після — ні.

## Правило

1. **Crashlytics — в кожній грі на Android і iOS, з першого релізу.** Claude сам читає падіння через REST API Crashlytics (токен gcloud
   власника, лише читання; Orbit Dash — `docs/lab/analytics/crashlytics.py top | fatal | issue | versions`). **Перед кожним релізом** — топ
   і FATAL за 30 днів обох платформ; падіння в нашому коді → патч з id проблеми в записі.
2. **Android:** плагін `com.google.firebase.crashlytics` у `:android` — він сам вивантажує mapping R8 з release-збірки (стеки читаються).
   Не вимикати `mappingFileUploadEnabled`.
3. **iOS (RoboVM / MobiVM): dSYM кожної збірки для App Store — у Crashlytics автоматично.**
   - RoboVM сам пише dSYM у `ios/build/robovm-build/tmp/IOSLauncher.app.dSYM` (DWARF + символи Java), але ніхто його не вивантажує.
   - Задача gradle (Orbit Dash: `iosCrashlyticsSymbols` у `ios/build.gradle.kts`), `createIPA` → `finalizedBy` неї: звіряє UUID dSYM з
     бінарником `.app` **і** з бінарником в IPA (чужий dSYM не піде), кладе копію `ios/build/dsym/IOSLauncher-<версія>-<збірка>-<UUID>.dSYM.zip`,
     вивантажує `upload-symbols` з того самого `Firebase.zip` (`-gsp GoogleService-Info.plist -p ios`; ключів не треба). Упало вивантаження —
     задача червона, IPA ціла: повторити задачу.
   - Чекліст релізу: `*.dSYM.zip` — поруч з IPA в `market/results/<реліз>/builds/`; робочу копію релізу прибирати **лише після цього**;
     перевірити Firebase → Crashlytics → dSYMs: UUID збірки — «Uploaded».
   - Стара IPA без dSYM (до цього правила) — відновити з `Symbols/<UUID>.symbols` усередині IPA (Orbit Dash: `ios/tools/dsym-from-symbols.py`,
     самоперевірка `atos`); IPA без `.symbols` — не відновлюється (лінкер вписує час `.o` в UUID), стеки — лише в Xcode → Organizer → Crashes.
   - Перевірка після впровадження: debug-збірка на iPhone / симуляторі, лабораторне падіння → issue зі стеком нашого коду за 15–20 хв.
4. **API новіші за мінімальну iOS гри — лише з перевіркою.** На iOS нижче виклик дає `NSInvalidArgumentException … unrecognized selector` —
   SIGABRT; **RoboVM не перетворює NSException на виняток Java, `runCatching` / `try` НЕ рятує.** Тож: `respondsToSelector(…)` і / або версія
   ОС (`Foundation.getMajorSystemVersion()`) **до** виклику, і рівноцінна дія для старої iOS (напр. AVAudioFile до iOS 18 — `dispose()` замість
   `close()`). Одна обгортка на API, не копії.
   - Сторож: сканер байткоду `:ios` проти `API_AVAILABLE` заголовків SDK (Orbit Dash `docs/lab/ios/api-availability/scan.py`) і юніт-тест
     (Orbit Dash `NewerApiGuardTest`): новий виклик API, новішого за мінімум, поза дозволеною обгорткою — тест червоний.
5. **Найстаріша iOS — перевірка перед релізом.** Рантайм симулятора найстарішої iOS, яку ще бере Xcode (зараз **iOS 17.5**; iOS 16 і нижче Xcode 27
   не запускає): гра стартує, грає рівень / головний цикл, звук є. Рантайм старої iOS — лише з developer.apple.com/download/all (вхід власника),
   `xcrun simctl runtime add <dmg>`; `xcodebuild -downloadPlatform` для 17.x його не дає. Файл .dmg після встановлення — у Кошик (Xcode тримає
   свою копію).

## Готовий промпт для `CLAUDE.md` гри

```markdown
## Падіння гравців — Crashlytics, Android і iOS (правило студії docs/process/crash-reporting.md, власник 20.11.2026)

- Crashlytics читаю сам (REST API, лише читання); перед кожним релізом — топ і FATAL за 30 днів обох платформ; падіння в нашому коді → патч з id.
- iOS: `createIPA` сама вивантажує dSYM у Crashlytics (задача dSYM з UUID-звіркою; копія `*.dSYM.zip` — поруч з IPA в market/results);
  після релізу — UUID збірки в Firebase → Crashlytics → dSYMs «Uploaded».
- API новіші за MinimumOSVersion — лише через перевірку (`respondsToSelector` / версія ОС) і обгортку; NSException через runCatching не ловиться.
  Сторож — сканер API і тест.
- Перед релізом iOS — гра на симуляторі найстарішої iOS, яку бере Xcode (зараз 17.5).
```

## Еталон

Orbit Dash (приватний репо): `Orbit Dash/docs/patches/454-ios-crashlytics-dsym.md`, `456-ios-avaudiofile-close.md`; код — `ios/build.gradle.kts`
(`iosCrashlyticsSymbols`), `ios/tools/dsym-from-symbols.py`, `ios/src/main/kotlin/…/audio/AvFiles.kt`, `docs/lab/ios/api-availability/scan.py`,
`ios/src/test/…/NewerApiGuardTest.kt`; знімок і таблиця виправлень — `docs/research/crashlytics/2026-11-19.md`.
CubePix: передано сесії CubePix 20.11.2026 (той самий стек — RoboVM, Firebase.zip, Crashlytics з патча 65).
