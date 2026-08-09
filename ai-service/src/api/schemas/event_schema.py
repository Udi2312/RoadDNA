from pydantic import BaseModel, Field
from typing import List, Optional

class SensorEventInput(BaseModel):
    event_id: str
    device_id: str
    latitude: float
    longitude: float
    speed_kmh: Optional[float] = None
    accel_x: float
    accel_y: float
    accel_z: float
    accel_magnitude: float
    gyro_x: float
    gyro_y: float
    gyro_z: float

class ClassifyBatchRequest(BaseModel):
    events: List[SensorEventInput]

class ClassificationResult(BaseModel):
    event_id: str
    predicted_label: str
    confidence: float
    model_version: str

class ClassifyBatchResponse(BaseModel):
    results: List[ClassificationResult]
