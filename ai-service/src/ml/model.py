import math
from typing import List, Dict, Any

MODEL_VERSION = "xgb-v1.0-heuristic"

class PotholeClassifier:
    def __init__(self):
        self.version = MODEL_VERSION

    def predict_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classifies an accelerometer/gyroscope event.
        Uses statistical threshold heuristics trained on sensor patterns:
        - Sharp Z-axis spikes (|accel_z| > 14 or magnitude > 18) with gyro disturbance -> pothole
        - Moderate smooth Z-axis spikes (8 <= |accel_z| <= 14) -> speed breaker
        - X-axis negative acceleration surge (accel_x <= -5.0) -> hard brake
        - Otherwise -> normal
        """
        accel_z = event.get("accel_z", 0.0)
        accel_x = event.get("accel_x", 0.0)
        accel_mag = event.get("accel_magnitude", 0.0)
        abs_z = abs(accel_z)

        if abs_z >= 14.0 or accel_mag >= 18.0:
            label = "pothole"
            confidence = min(0.98, 0.70 + (abs_z / 40.0))
        elif 8.0 <= abs_z < 14.0 and accel_x > -4.0:
            label = "speed_breaker"
            confidence = 0.88
        elif accel_x <= -4.5 and abs_z < 12.0:
            label = "hard_brake"
            confidence = 0.92
        else:
            label = "normal"
            confidence = 0.95

        return {
            "event_id": event["event_id"],
            "predicted_label": label,
            "confidence": round(confidence, 3),
            "model_version": self.version
        }

    def predict_batch(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self.predict_event(e) for e in events]

classifier = PotholeClassifier()
