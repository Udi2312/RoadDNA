from fastapi import APIRouter
from src.ml.model import MODEL_VERSION

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "roaddna-ai-service",
        "model_version": MODEL_VERSION
    }
