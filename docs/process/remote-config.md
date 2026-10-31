# Remote Config гри: один JSON `config` — TikTok (Android і iOS), сезони, оновлення iPhone

Власник 31.10.2026: «правило про ремоут конфіг і тікток — у репозиторій студії… тікток зараз тільки для Android, а вийде iOS — там теж має
бути TikTok SDK… коли вийде iOS, я дам ід і секрет — допишеш у ремоут конфіг». Як у CubePix і Orbit Dash.

## Схема

Кожна гра має в Firebase Remote Config **один параметр `config`** (рядок JSON). Блоки:

```json
{
  "tiktok": {
    "app_id": "<TikTok App ID Android>[,<ще один>]",
    "secret": "<App secret Android>",
    "ios": { "app_id": "<TikTok App ID iOS>", "secret": "<App secret iOS>" }
  },
  "live": { "halloween": { "on": true, "from": "2026-10-29", "to": "2026-11-30" } },
  "ios":  { "latest": "", "app_id": "<Apple ID гри в App Store>" }
}
```

- **`tiktok`** — TikTok Business SDK (Events Manager), стартує **лише зі згодою гравця** (UMP / ATT: `ConsentRules.tiktokAllowed`).
  - `app_id` / `secret` на верхньому рівні — **Android** (так читають усі вже випущені збірки — не переносити й не перейменовувати,
    інакше старі версії гри втратять TikTok);
  - `tiktok.ios` — **iOS**: окрема програма в TikTok Events Manager, свої App ID і секрет. Старі збірки Android поле `ios` ігнорують.
  - порожньо / немає — SDK не стартує (тихо, без помилок).
- **`live`** — вікна сезонів (`on`, `from`, `to` — місцева дата гравця); вшиті дати в грі — запас без мережі; `on: false` — вимикач.
- **`ios`** — оновлення на iPhone (`docs/ux/ios-updates.md`): `latest` пише Claude лише після «вже в App Store» від власника.

## Хто що пише

- **Секрети (TikTok) — ніколи в git, логи чи чат-підсумки.** Власник дає App ID і секрет — Claude вписує їх у `config` інструментом гри
  (`rc.py` / `tools/firebase/rc.py`), який маскує секрет у виводі й не чіпає решти блоків; або власник вставляє сам у консолі Firebase.
- Будь-який запис у бойовий Remote Config — лише з «так» власника; перед записом — прочитати чинний `config` і змінити тільки свій блок.
- Новий блок — спершу в цьому правилі й у коді парсера гри (невідомі поля парсер ігнорує), потім у Remote Config.

## У грі (libGDX, Android + iOS)

- Android — Firebase Remote Config SDK → текст `config` у `RemoteLive.config` (`:core`), TikTok — `TikTokManager` з `config.tiktok`.
- iOS — REST `firebase:fetch` без SDK (`IOSRemoteConfig`) → той самий текст у `RemoteLive.config`; TikTok iOS — TikTok Business SDK для
  iOS (біндинг RoboVM) з `config.tiktok.ios`, лише після згоди ATT / UMP.
- Тести парсера — на фікстурах з усіма блоками, з порожніми й зламаними значеннями.
