# n8n Local (SQLite)

Local n8n instance using SQLite and a bind-mounted data folder for easy migration.

## Run

```bash
docker compose up -d
```

Open: http://localhost:4343

## Move to another computer

1. Stop containers:

```bash
docker compose down
```

2. Copy the entire folder:

- `n8n/` (this includes `docker-compose.yml`, `.env`, and `data/`)

3. On the new computer, run:

```bash
docker compose up -d
```

Your workflows and credentials are stored in `data/` and will load as-is.

## Notes

- Keep `N8N_ENCRYPTION_KEY` stable. If you change it, existing credentials become unreadable.
- The `data/` folder contains the SQLite DB and instance config. Back it up as a unit.

API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTA0ZTY1ZS1kODQwLTQ4MjktYmMwMi1kMzg4YzYxNjc3NGYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOGJhMjU2ZjYtZjIxZi00MDZlLWJhYTYtYTNkMTY2ODU1ODdmIiwiaWF0IjoxNzgwNTczMzk4LCJleHAiOjE3ODMxMzQwMDB9.zOldDHaKh6Ty5R7Tp4wimL8fyU7mSYRWfBXf2EvwlfI
