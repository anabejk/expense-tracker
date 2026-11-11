# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Команды

```bash
npm run dev      # dev-сервер Vite
npm run build    # прод-сборка в dist/ (с sourcemaps)
npm run preview  # раздача собранного dist/
```

Тестов, линтера и форматтера в проекте нет — не выдумывай команды для них.

Нужен `.env` (см. `.env.example`) с `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_API_KEY`, `VITE_SHEET_ID`, `VITE_SHEET_NAME`. Читаются они ровно в одном месте — `src/config.js` — и дальше используются как `CONFIG.*`.

## Стек и соглашения

Vue 3 + Vite + Vuex 4 + vue-router 4, SCSS. Несмотря на оставшийся от шаблона Vite README, **никакого `<script setup>` и Composition API**: все компоненты написаны на Options API с `mapState` / `mapGetters` / `mapActions`. Придерживайся этого стиля.

Тексты интерфейса, комментарии в сторе и отладочные `console.log` — на русском; валюта — тайский бат (฿).

## Архитектура

### Бэкенд — это Google Sheets

Сервера нет. `index.html` подключает `apis.google.com/js/api.js` и `accounts.google.com/gsi/client` обычными тегами `<script>`, поэтому **`gapi` и `google` — глобальные переменные**, их никогда не импортируют. Единственная точка инициализации — `mounted()` в `App.vue`: `gapi.load('client')` → `gapi.client.init()` с discovery-документом Sheets → `auth/initGoogleAuth` → `auth/tryRestoreSession` → `SET_START_FORM_DATE`.

Раскладка таблицы — колонки **A:E = дата, сумма, категория, комментарий, id**, первая строка это заголовки. `loadExpenses` отрезает заголовок и сохраняет `rowIndex: index + 1` — это и есть 0-индексный номер строки листа, который ждёт `deleteDimension`. Всё, что работает с позициями строк, завязано на этот сдвиг.

Id строк генерируются на клиенте в `utils/id.js` как `e${Date.now()}` — префикс `e` тут намеренный, он не даёт Sheets переформатировать ячейку в число.

### Все запросы к таблице идут через `auth/apiRequest`

`apiRequest` принимает функцию-запрос, выполняет её, а при 401 сбрасывает `isSignedIn` в false и пробрасывает ошибку дальше. Компоненты не должны вызывать `gapi.client.sheets.*` напрямую — собери функцию запроса внутри action в `expenses` и вызови `dispatch('auth/apiRequest', fn, { root: true })`.

Состояние авторизации живёт в `store/modules/auth.js`. Токен доступа кешируется в `localStorage` под ключом `gapi_token`; `tryRestoreSession` переиспользует его при загрузке, а если не вышло — выставляет `sessionExpired`, и `AuthScreen` показывает «Обновить авторизацию» вместо кнопки первого входа.

### Удаление — это «перечитать, потом удалить»

`expenses/deleteExpense` сначала спрашивает подтверждение, потом **заново загружает таблицу** и ищет запись по `id`, а если совпадений ноль или больше одного — выходит с алертом (строка могла сдвинуться с момента последней загрузки). В запросе `deleteDimension` захардкожен `sheetId: 0` — это gid листа «Все расходы».

### Два независимых канала ошибок

- `store/modules/errors.js` + `utils/getReadableError.js` — неблокирующий. `getReadableError` превращает HTTP-статус в `{ title, status, message }` на русском, результат рисуется инлайн в `FormScreen` / `AuthScreen`. Новые коды ошибок добавляй туда, а не пиши тексты сообщений в компонентах.
- `store/modules/modal.js` — блокирующий. `modal/confirm` и `modal/alert` возвращают промис, который `modal/close` резолвит ответом пользователя. Резолвер — одна переменная на уровне модуля, поэтому одновременно может быть открыто только одно окно. `AppDialog` смонтирован один раз в `App.vue` и отрисовывает то, что лежит в `modal.modal`, через презентационный `AppModal`.

### Даты — это строки по бангкокскому времени

`utils/date.js` — единственное место, где вообще создаются даты. Всё, что хранится и сравнивается, это строка `YYYY-MM-DD` (получается через приём с локалью `sv-SE` и `timeZone: 'Asia/Bangkok'`), а ключ месяца — `YYYY-MM`, то есть `date.substring(0, 7)`. `loadAvailableMonths` собирает список месяцев для селекта из самих данных и добавляет текущий месяц в начало, если по нему ещё нет трат. Не тащи объекты `Date` в state и в сравнения.

### Все производные числа — в геттерах

`filteredExpenses` (по `selectedMonth`) → `dailyTotals` → `todayTotal` / `monthTotal` / `categoryTotals` / `getDaysWithoutSpend`. `isBusy` (`isSaving || deletingId !== null`) — то, чем блокируются кнопки на время запросов. Экраны должны читать эти геттеры, а не пересчитывать суммы у себя.

### Стили

Вся настоящая вёрстка — в глобальном SCSS: `src/styles/main.scss` подключает партиалы через `@use` (`core/_variables.scss` держит CSS-переменные, дальше `helpers/`, `common/`, `screens/`, плюс `_header`, `_navigation`, `_auth`, `_modal`). Блоки `<style scoped>` в компонентах пустые или почти пустые намеренно — новые стили клади в подходящий партиал, а не в SFC. `src/style.css` мёртвый: его импорт в `main.js` закомментирован.

## Что не доделано

- Редактирование траты: кнопка с карандашом в `FormScreen.vue` только пишет в консоль, action `editExpense` ещё нет (в сторе под него зарезервирована пустая секция «Edit data in Google Sheets»).
- `src/components/CategoryChart.vue` и `src/components/DayBreakdownModal.vue` — пустые файлы, а в `TotalScreen.vue` пустой блок `.month-categories` ждёт график.
- `monthLimit: 55000` захардкожен в `data()` у `HomeScreen.vue`, хотя дневные лимиты (`dayLimitGreen` / `dayLimitYellow`) лежат в сторе.

## Как работать с автором

Это учебный проект. Автор вносит правки в файлы сама — давай код в чате с объяснением, что он делает и куда его положить, а не редактируй файлы напрямую, если она не попросила об обратном.
