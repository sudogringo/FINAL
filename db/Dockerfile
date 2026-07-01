FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY seed.py api.py ./

# Data dir is mounted as a volume so the DB persists across restarts
# seed.py writes to /data/golden_harvest.db
RUN mkdir -p /data

CMD ["sh", "-c", "python seed.py && uvicorn api:app --host 0.0.0.0 --port 8000"]
