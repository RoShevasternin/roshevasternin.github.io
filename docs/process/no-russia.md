# Росії немає — у жодній грі студії (правило студії)

**Власник 22.11.2026:** «прибери росію, що б з росії не могли грати… можна це правило і в репо студії записати і передати орбіт даш —
росія нам не треба».

## Правило

Ігри Lewydo **недоступні в Росії** — в усіх магазинах і на всіх платформах:

| Де | Як | Перевірка |
|---|---|---|
| **App Store** | App Store Connect → Pricing and Availability → Russia вимкнено. API: `PATCH /v1/territoryAvailabilities/{id}` `{available:false}` (id — з `GET /v2/appAvailabilities/{id}/territoryAvailabilities?include=territory`, territory `RUS`). | статус `CANNOT_SELL` / `PROCESSING_TO_NOT_AVAILABLE` |
| **Події App Store** (In-App Events) | `territorySchedules` — без `RUS` | подія не показується в Росії |
| **Покупки App Store** | з застосунком, якого в країні немає, не продаються; нові товари — однаково без `RUS` | — |
| **Google Play** | Play Console → Test and release → Production → Countries / regions → зняти Russia → Save → Publishing overview → відправити на перевірку (з managed publishing публікує власник). Через API не можна: `countryavailability` — лише читання. | «177 countries / regions» без Russia |
| **Нова гра / новий трек** | список країн одразу без Росії | — |

- **Мова:** російської мови немає ніде (ні в грі, ні на сайтах, ні hreflang). Кожен список мов закінчується рядком
  «Россия, останови войну в Украине» — він не мова й не кнопка (стандарт студії, див. ігри).
- **Китай (материковий)** і **Корея** — окремі причини (ліцензія ігор NPPA, рейтинг GRAC), не це правило; у CubePix вони теж вимкнені.

## Як у коді

- CubePix: `cubepix-prototype/tools/store/appstore-kit/asc.mjs` — `OFF = ['KOR', 'CHN', 'RUS']` (доступність, події), команда
  `territory <ISO3> [on|off]`.
- Orbit Dash: так само у своєму інструменті App Store Connect.

## Готовий текст для `CLAUDE.md` гри

> **Росії немає (правило студії `docs/process/no-russia.md`, власник 22.11.2026).** Гра недоступна в Росії в App Store і Google Play;
> події App Store — без `RUS`; нова гра чи трек — список країн одразу без Росії. Російської мови немає ніде.
