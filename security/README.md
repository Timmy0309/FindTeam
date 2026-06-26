# Security Testing

## Автоматизированный фаззинг (Jest + fast-check)

Воспроизводимые сценарии находятся в `backend/tests/fuzz/`:

| Файл | Назначение |
|------|------------|
| `api.fuzz.test.js` | SQL-инъекции, XSS, переполнение, случайные строки |
| `auth.fuzz.test.js` | Некорректные JWT, CORS, отсутствие токена |
| `rbac.fuzz.test.js` | Попытки обхода RBAC, IDOR |

### Запуск

```bash
cd backend
cp .env.test.example .env.test   # при необходимости
npm install
npm run test:fuzz
```

Отчёты сохраняются в `backend/tests/reports/`:
- `fuzz-report.json` — машиночитаемый
- `fuzz-report.md` — краткая сводка

### Требования

- PostgreSQL с базой `gameteam_db` (или настройте `.env.test`)

## OWASP ZAP (DAST)

Для воспроизводимого сканирования с OWASP ZAP:

```bash
# 1. Запустите приложение
docker-compose up -d

# 2. Запустите baseline-скан (нужен Docker)
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t http://host.docker.internal:5000/api/health \
  -r security/reports/zap-baseline-report.html \
  -c security/zap/zap-rules.conf
```

Конфигурация правил: `security/zap/zap-rules.conf`

## RBAC

Роли: `user`, `admin`

Права:
- `can_view_teams` — просмотр команд
- `can_view_players` — список игроков
- `can_send_messages` — сообщения
- `can_create_teams` — создание команд
- `can_manage_users` — только у admin

Проверка прав выполняется на сервере при каждом запросе (роли загружаются из БД).
