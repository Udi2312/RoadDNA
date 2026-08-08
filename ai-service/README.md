# RoadDNA AI Service

Python FastAPI microservice responsible for real-time sensor event classification and spatial pothole clustering.

## Setup & Running

```bash
# 1. Create Python virtual environment
python -m venv venv

# 2. Activate virtual environment (Windows)
.\venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start AI Service
uvicorn src.api.main:app --reload --port 8000
```

## API Endpoints

- `GET /health` — Service health & active model version
- `POST /classify` — Batch event classification
