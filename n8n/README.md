# n8n Local (SQLite)

Local n8n instance using SQLite and a bind-mounted data folder for easy migration.

## Run

```bash
docker compose up -d
```

Open: http://localhost:4343

## Move to another computer

1) Stop containers:

```bash
docker compose down
```

2) Copy the entire folder:
- `n8n/` (this includes `docker-compose.yml`, `.env`, and `data/`)

3) On the new computer, run:

```bash
docker compose up -d
```

Your workflows and credentials are stored in `data/` and will load as-is.

## Notes

- Keep `N8N_ENCRYPTION_KEY` stable. If you change it, existing credentials become unreadable.
- The `data/` folder contains the SQLite DB and instance config. Back it up as a unit.
