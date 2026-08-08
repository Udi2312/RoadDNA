from fastapi import APIRouter, HTTPException
from src.api.schemas.event_schema import ClassifyBatchRequest, ClassifyBatchResponse
from src.ml.model import classifier

router = APIRouter()

@router.post("/classify", response_model=ClassifyBatchResponse)
async def classify_events(payload: ClassifyBatchRequest):
    if not payload.events:
        raise HTTPException(status_code=400, detail="Events list cannot be empty")
    
    raw_events = [e.model_dump() for e in payload.events]
    results = classifier.predict_batch(raw_events)
    return {"results": results}
