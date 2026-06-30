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

## API Key (for Claude Code / scripts)

Never commit your actual key. To get it:

1. Open http://localhost:4343
2. Go to **Settings → API → Create an API Key**
3. Copy the generated JWT and set it in your environment:

```bash
export N8N_API_KEY=<your-key-here>
```

Or add it to `n8n/.env` (already gitignored):

```
N8N_API_KEY=<your-key-here>
```
