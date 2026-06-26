# FindTeam — Платформа для поиска команд в онлайн-игры

## О проекте

FindTeam — это клиент-серверное веб-приложение для поиска и формирования команд в многопользовательских онлайн-играх. Платформа позволяет игрокам создавать команды, присоединяться к существующим, обмениваться сообщениями и находить тиммейтов для совместной игры.

## Функциональные возможности

- Регистрация и авторизация пользователей с JWT-аутентификацией
- RBAC: роли (`user`, `admin`) и права (`can_view_players`, `can_create_teams` и др.)
- Создание, редактирование и удаление игровых команд
- Присоединение к командам и выход из них
- Фильтрация команд по игре и количеству свободных мест
- Система личных сообщений (диалоги между игроками)
- Просмотр популярных игр из базы данных
- Защита маршрутов по авторизации и правам доступа

## Технологический стек

| Компонент | Технологии |
|-----------|------------|
| Фронтенд | React, Redux Toolkit, React Router, Axios, CSS Modules |
| Бэкенд | Node.js, Express.js, JWT, bcrypt |
| База данных | PostgreSQL |
| Тестирование | Jest, supertest, fast-check (фаззинг) |
| Инфраструктура | Docker, Docker Compose, Nginx, Git |

## Безопасность

- `JWT_SECRET` задаётся через `.env` (минимум 32 символа, проверка при старте)
- CORS ограничен списком origins (`CORS_ORIGIN`)
- PostgreSQL в Docker доступен только внутри сети контейнеров (порт не публикуется)
- RBAC проверяется на сервере при каждом запросе

## Тестирование

### Фаззинг-тесты API

```bash
cd backend
cp .env.test.example .env.test
npm install
npm run test:fuzz
```

Отчёты: `backend/tests/reports/fuzz-report.json` и `fuzz-report.md`

Подробнее: [security/README.md](security/README.md)

### Все тесты (backend + frontend)

```bash
npm run test
```

## Запуск проекта

### Требования

- Node.js (версия 18 или выше)
- PostgreSQL (версия 15 или выше)
- Docker и Docker Compose (опционально)

### Локальный запуск (без Docker)

**1. Настройка окружения**

```bash
cd backend
cp .env.example .env
# Отредактируйте JWT_SECRET (минимум 32 символа) и пароль БД
```

**2. Настройка базы данных**

```bash
createdb gameteam_db
```

**3. Запуск приложения**

```bash
npm run install:all
npm run dev
```

### Запуск через Docker

```bash
cp .env.docker.example .env
# Задайте уникальный JWT_SECRET в .env
docker-compose up -d
```

Приложение: http://localhost:3000

Администратор создаётся автоматически (см. `ADMIN_EMAIL` / `ADMIN_PASSWORD` в `.env`).
