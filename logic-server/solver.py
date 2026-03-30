# solver.py
import numpy as np
import os
import logging
from pydantic import BaseModel
from typing import List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

# 1. Try to load .env only if it exists (Local Development)
env_path = Path(__file__).resolve().parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    # If not found, we assume we are in Cloud Run 
    # and variables are already in the system environment
    pass

# 2. Access the variable
INTERNAL_SECRET_TOKEN = os.getenv("INTERNAL_SECRET_TOKEN")
SAFE_THRESHOLD_METERS = 500.0  
EARTH_RADIUS_KM = 6371.0
SAFE_DISTANCE_KM = SAFE_THRESHOLD_METERS / 1000.0

# 3. Add a safety check to catch configuration issues early
if not INTERNAL_SECRET_TOKEN:
    print("WARNING: INTERNAL_SECRET_TOKEN is not set in environment!")


class Shelter(BaseModel):
    x: float  # lng
    y: float  # lat
    name: str = "Unknown Shelter"
    model_config = {"extra": "allow"}

class SafetyRequest(BaseModel):
    routes: List[List[List[float]]]  # list of [lat, lng]
    shelterData: List[Shelter]      # list of {x: lng, y: lat}

# Set up logging to show in the terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def vectorized_haversine(route_pts: np.ndarray, shelter_pts: np.ndarray) -> np.ndarray:
    """
    Calculate the great circle distance between two sets of points
    on the earth using a vectorized Haversine formula.
    
    route_pts: (N, 2) array of [lat, lng] in degrees
    shelter_pts: (M, 2) array of [lat, lng] in degrees
    
    Returns: (N, M) matrix of distances in km
    """
    # Convert decimal degrees to radians
    r_lat, r_lng = np.radians(route_pts[:, 0:1]), np.radians(route_pts[:, 1:2])  # Shapes: (N, 1)
    s_lat, s_lng = np.radians(shelter_pts[:, 0]), np.radians(shelter_pts[:, 1])  # Shapes: (M,)

    # Differences
    dlat = s_lat - r_lat  # Shape: (N, M)
    dlng = s_lng - r_lng  # Shape: (N, M)

    # Haversine formula
    a = np.sin(dlat / 2)**2 + np.cos(r_lat) * np.cos(s_lat) * np.sin(dlng / 2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    
    return EARTH_RADIUS_KM * c

def calculate_safety_for_geometry(coords: List[List[float]], shelters: List[Shelter]):
    """Helper used by both endpoints to score a route."""
    if not coords or not shelters:
        return {"score": 0.0, "report": []}
    
    route_array = np.array(coords)
    if route_array[0][0] > 33: # Coordinate swap for Israel
        route_array = route_array[:, [1, 0]]
    
    sampled = route_array[::5]
    shelter_arr = np.array([[s.y, s.x] for s in shelters])
    
    dist_matrix = vectorized_haversine(sampled, shelter_arr)
    min_dists = np.min(dist_matrix, axis=1)
    indices = np.argmin(dist_matrix, axis=1)
    
    is_safe = min_dists <= SAFE_DISTANCE_KM
    score = (np.sum(is_safe) / len(sampled)) * 100.0
    
    report = []
    for i in range(len(sampled)):
        report.append({
            "p": sampled[i].tolist(),
            "d": float(min_dists[i] * 1000),
            "s": bool(is_safe[i]),
            "shelter": shelters[indices[i]].dict()
        })
    return {"score": round(score, 2), "report": report}

