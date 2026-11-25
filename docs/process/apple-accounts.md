# Акаунти Apple студії — який брати (правило студії)

**Власник 23.11.2026:** «dev@lewydo.com … підійде і для Orbit Dash, і для всієї студії, і інших ігор — запиши».

| Apple ID | чий / що | для чого |
|---|---|---|
| **veldan1202@gmail.com** | особистий Apple ID власника; Account Holder у App Store Connect (продавець VLADYSLAV SHESTERNIN), адмін Apple Business і Apple Ads | усе, де потрібен власник: App Store Connect, підписи, договори, оплата |
| **dev@lewydo.com** | **технічний Apple ID студії** (створено 23.11.2026; пошта студії, Cloudflare пересилає листи власнику) | **службові й технічні доступи Apple для будь-якої гри студії**: API (Apple Ads — користувач «Lewydo API», роль API Read Only), інструменти, тестові доступи |

## Правило

- Потрібен службовий доступ Apple (API, сервісний користувач, інструмент) для **Orbit Dash, CubePix чи нової гри** — запрошуємо **dev@lewydo.com**,
  а не особистий veldan1202, і **новий Apple ID не створюємо**.
- Роль — найменша, що працює (для звітів — лише читання).
- **Пароль і коди — лише у власника.** Claude їх не знає, не вводить і не зберігає; ключі API — у приватному репо гри (`release/…`), правило
  `project-layout.md`.
- Доступ знімається в самому сервісі (напр., Apple Ads → User Management), не зачіпаючи особистий Apple ID власника.

## Де вже використано

- **Apple Ads**, акаунт Lewydo (orgId 25847590): «Lewydo API», API Read Only — ключ `release/apple-ads/` у Game-CubePix-PRIVATE,
  скрипт `cubepix-libgdx/tools/ads/apple_ads.py` (ранковий звіт, розділ «📣 Apple Ads»). Той самий акаунт Apple Ads і той самий
  користувач підійдуть для реклами Orbit Dash (кампанія іншої гри — та сама org).

## Готовий текст для `CLAUDE.md` гри

> **Акаунти Apple (правило студії `docs/process/apple-accounts.md`):** службові доступи Apple (API, сервісні користувачі) — лише через технічний
> Apple ID студії **dev@lewydo.com**; особистий veldan1202 — для App Store Connect і рішень власника; нових Apple ID не створювати;
> паролі й коди — лише у власника.
