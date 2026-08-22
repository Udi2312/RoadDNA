import math
from typing import List, Dict, Any

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes the Haversine distance in meters between two lat/lon points."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return R * c

def compute_severity(report_count: int, distinct_devices: int, avg_magnitude: float) -> float:
    """
    Computes severity score (0 - 100):
    severity = (report_count * 0.4) + (distinct_devices * 0.4) + (avg_accel_magnitude * 0.2)
    """
    score = (report_count * 0.4) + (distinct_devices * 0.4) + (avg_magnitude * 0.2)
    return round(min(100.0, score), 2)
