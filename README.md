# Цифровая визитка — Павел Мернов

NestJS backend с GraphQL API и Apollo Sandbox, Prisma ORM / PostgreSQL и React SPA-портфолио. Данные взяты из «Резюме 5 CS TS.pdf»: профиль, образование, языки, навыки и проекты, включая командные хакатонные Smart-Credit и naparnik. Проекты также представлены в разделе **проектного опыта** без вымышленных работодателей и дат.

Пятый проект — сама визитка со ссылкой на этот репозиторий и списком применённых технологий. Телефон и email в PDF не читаются надёжно, поэтому из контактов указан GitHub.

## Запуск в Docker

Нужны Docker Engine и Docker Compose v2:

```sh
docker compose up --build -d --wait
```

- SPA: http://localhost:8081
- GraphQL API и Apollo Sandbox: http://localhost:3000/graphql
- API также доступен через frontend: http://localhost:8081/graphql

Backend собирается в образ `digital-card-backend:local`, frontend — `digital-card-frontend:local`. Чтобы собрать и запустить только backend:

```sh
docker compose build api
docker compose up -d --wait api
```

При старте backend ожидает готовности PostgreSQL, применяет версионированные миграции и выполняет seed. Сервер запускается только после успеха всех шагов. Инициализация идемпотентна: повторный запуск не дублирует профиль, навыки, опыт и проекты. Seed синхронизирует данные владельца с `prisma/profile-data.ts` в одной транзакции, перезаписывая предыдущие значения.

PostgreSQL хранит данные в постоянном томе `postgres-data`. Обычная остановка сохраняет его:

```sh
docker compose logs api
docker compose down
```

`docker compose down -v` удаляет том со всеми данными — используйте только для намеренного полного сброса. Порты привязаны к loopback. Backend работает от непривилегированного пользователя `node`. Healthcheck проверяет настоящий GraphQL-запрос, frontend стартует после готовности backend.

Frontend собирается Vite в статические файлы, которые отдаёт Nginx. Nginx проксирует `/graphql` к backend, поэтому браузер использует один origin без дополнительной настройки CORS. Apollo Sandbox загружает свои ресурсы с серверов Apollo и требует интернета в браузере; SPA и API внешних ресурсов для работы не требуют.

## Локальная разработка

Нужны Node.js 22.12+ и npm. В первом терминале:

```sh
cp .env.example .env
npm ci
npm run build
npm start
```

Во втором:

```sh
npm --prefix frontend ci
npm --prefix frontend run dev
```

SPA доступен на http://localhost:5173. Vite проксирует `/graphql` на `http://127.0.0.1:3000`; при необходимости задайте `BACKEND_URL` перед запуском Vite. `DATABASE_URL` задаёт строку подключения PostgreSQL, `TEST_DATABASE_URL` при необходимости задаёт отдельный сервер для тестовых схем, `PORT` — порт backend, по умолчанию 3000.

Проверка production-сборки SPA:

```sh
npm run build:frontend
```

Для просмотра production-сборки с API используйте Docker: локальный `vite preview` не настраивает прокси backend.

## GraphQL API

```graphql
query BusinessCard {
  profile {
    name
    title
    description
    location
    education
    languages
    links {
      label
      url
    }
    skills {
      name
    }
    experience {
      company
      projectName
      position
      period
      startDate
      endDate
      achievements
    }
    projects {
      name
      description
      url
      website
      technologies
      period
      featured
    }
  }
}
```

`company` — организация или контекст проекта, `projectName` — название проекта, `position` — роль. `period`, `startDate` и `endDate` содержат даты из актуального резюме; `null` в `endDate` означает продолжающийся проект. У проекта `featured` отделяет семь избранных работ от остальных публичных репозиториев GitHub, а `period` хранит период или месяц создания.

Отсутствующий профиль возвращает `null`, пустые коллекции — `[]`. `url` проекта ведёт в репозиторий, `website` — необязательная ссылка на сайт. `technologies` — массив строк. Сначала API возвращает избранные проекты из резюме, затем остальные авторские публичные репозитории GitHub; форки исключены. API доступен только для чтения.

## Архитектура

```text
src/
  profile/
    profile.resolver.ts    GraphQL-контракт
    profile.service.ts     сценарий получения визитки и преобразование данных
    profile.repository.ts запросы Prisma
    profile.models.ts     публичные типы GraphQL
  prisma/
    prisma.service.ts     жизненный цикл подключения
prisma/
  migrations/             версионированная схема
  profile-data.ts         содержимое визитки
  seed.ts                 транзакционная синхронизация
frontend/
  src/                    React SPA, типизированный GraphQL-клиент и стили
  e2e/                    сценарии Playwright
  nginx.conf              статические файлы и прокси API
test/
  unit/                   изолированный сервис
  functional/             GraphQL-сценарии без базы
  integration/            настоящий PostgreSQL и Prisma
```

GraphQL-схема генерируется NestJS-декораторами из TypeScript (code first). Resolver делегирует сервису, сервис — репозиторию; Prisma не используется в API-слое. PrismaService открывает подключение и закрывает его при остановке NestJS.

PostgreSQL работает отдельным Docker-сервисом и хранит данные в постоянном томе. Внешние ключи с каскадным удалением поддерживают целостность; составные индексы по владельцу и порядку — выборку и стабильную сортировку. Коллекции хранятся в отдельных таблицах. Технологии проекта — JSON-строка: небольшой упорядоченный список без самостоятельного жизненного цикла и поиска по элементам; сервис преобразует его в публичный массив.

Связи загружаются через Prisma `include`: один SQL-запрос к профилю и до четырёх пакетных запросов к коллекциям. Число запросов не растёт с количеством элементов; N+1 отсутствует. Для небольшой визитки сознательно загружается весь профиль даже при запросе одного имени. Для каталога многих пользователей понадобятся пагинация, выборка по selection set и DataLoader для связей.

SPA использует React и встроенный `fetch`: без дополнительного клиентского кэша для одной страницы. Отображает загрузку, ошибки HTTP и GraphQL, пустой профиль и повторную загрузку; умеет фильтровать проекты по названию и технологии. Запросы отменяются при размонтировании компонента. Интерфейс адаптирован для узких экранов.

В production-образе backend остаются Prisma CLI и tsx для миграций и seed; инструменты тестирования удаляются через `npm prune --omit=dev`. Запуск рассчитан на один экземпляр backend: при нескольких репликах миграцию и seed нужно вынести в отдельный этап. Версии зависимостей фиксируются lock-файлами; overrides исправляют транзитивные зависимости `effect`, `deepmerge-ts`, `@graphql-tools/utils`.

## Тесты

Установить зависимости и Chromium:

```sh
npm ci
npm --prefix frontend ci
npx playwright install chromium
```

В минимальном Linux-окружении дополнительно могут потребоваться системные библиотеки Chromium (`npx playwright install-deps chromium`).

| Уровень     | Команда                    | Что проверяет                                                                                                                                                                                                     |
| ----------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        | `npm run test:unit`        | Сервис с заменённым репозиторием: отсутствие профиля, преобразование технологий без изменения исходных данных, пустые коллекции, проброс ошибок                                                                   |
| Functional  | `npm run test:functional`  | Настоящие NestJS resolver/service и GraphQL-схема с заменённым хранилищем: вложенные поля, проектный опыт, nullable даты, ошибки контракта, отсутствие мутаций                                                    |
| Integration | `npm run test:integration` | Изолированная PostgreSQL-схема, миграции и настоящий Prisma: повторный seed, атомарный откат при ошибке, порядок данных, каскадное удаление, постоянное число SQL при росте коллекций                             |
| E2E         | `npm run test:e2e`         | Chromium на desktop и mobile: React → HTTP GraphQL → NestJS → Prisma → PostgreSQL, профиль/опыт/проекты, поиск, пустая выдача; отдельно — контролируемые HTTP/GraphQL ошибки, повторная загрузка и пустой профиль |

```sh
npm test             # unit + functional + integration
npm run test:all     # все четыре уровня
npm run typecheck
npm --prefix frontend run typecheck
```

Интеграционные тесты используют отдельные временные PostgreSQL-схемы. E2E автоматически поднимает backend на порту 3100 с новой временной схемой и Vite на порту 4173. Эти порты должны быть свободны, а PostgreSQL из Compose — запущен. Тесты не используют рабочую схему; временные схемы удаляются при завершении. Для e2e со сбоем сохраняются trace и screenshot в `test-results/`; успешный сценарий профиля также сохраняет снимок страницы для desktop и mobile.

Форматирование исходников: `npm run format`.
