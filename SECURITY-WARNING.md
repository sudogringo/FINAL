# ⚠️ DO NOT MAKE THIS REPOSITORY PUBLIC

Three `.env` files (`.env`, `n8n/.env`, `frontend/.env`) were committed to git
history with real secrets in them. `.gitignore` has since been fixed so this can't
happen again going forward, but **the secrets are still in git history and have not
been rotated yet.**

## Still exposed in git history

- `N8N_ENCRYPTION_KEY` — n8n's master key, encrypts everything in its credentials
  manager (including the real ones below)
- n8n `API_KEY` — n8n's own REST API key
- `VITE_N8N_WF4_WEBHOOK` — a workflow webhook URL

## Real credentials stored in n8n (`n8n/data/database.sqlite`), encrypted with the
## above key — also treat as compromised

- Google Sheets account (OAuth2)
- Gmail account (OAuth2)
- Google Drive account (OAuth2)
- Google API Key (PageSpeed)

## Before this repo can ever go public

1. Rotate every credential listed above (n8n UI for the n8n-side ones, Google Cloud
   Console for the Google OAuth/API key ones).
2. Purge the `.env` files from git history with `git filter-repo` and force-push.
3. Only then is it safe to flip visibility to public.

Repo is currently **private** with one trusted collaborator — that's the only reason
this isn't an active incident. Keep it that way until the steps above are done.
