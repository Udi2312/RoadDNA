from fastapi import FastAPI
from src.api.routes import classify, health

app = FastAPI(
    title="RoadDNA AI Service",
    description="ML service for real-time sensor event classification and spatial clustering",
    version="1.0.0"
)

app.include_router(health.router)
app.include_router(classify.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000, reload=True)
