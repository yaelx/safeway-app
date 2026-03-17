from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np

app = FastAPI()

class Shelter(BaseModel):
    x: float  # lng
    y: float  # lat

class SafetyRequest(BaseModel):
    routePoints: List[List[float]]  # list of [lat, lng]
    shelterData: List[Shelter]      # list of {x: lng, y: lat}

# ==========================================
# GLOBAL CONFIGURATION
# Change this value to adjust the safety distance
# ==========================================
SAFE_THRESHOLD_METERS = 500.0  
# ==========================================

EARTH_RADIUS_KM = 6371.0
SAFE_DISTANCE_KM = SAFE_THRESHOLD_METERS / 1000.0

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

@app.post("/evaluate_route")
def evaluate_route(req: SafetyRequest) -> Dict[str, Any]:
    print(f"--- SOLVER CALLED | Points: {len(req.routePoints)} | Shelters: {len(req.shelterData)} ---")
    
    if not req.routePoints or not req.shelterData:
        return {"safetyScore": 0.0, "safetyReport": []}

    # 1. Prepare Route (Ensure Lat/Lng)
    route_array = np.array(req.routePoints)
    # If the first value is > 33, it's Lng. Swap to [Lat, Lng]
    if route_array[0][0] > 33:
        route_array = route_array[:, [1, 0]]
    
    sampled_route = route_array[::10]

    # 2. Prepare Shelters (Ensure Lat/Lng)
    # req.shelterData has {x: lng, y: lat}
    shelter_arr = np.array([[s.y, s.x] for s in req.shelterData])

    # --- CRITICAL DEBUG PRINT ---
    if len(sampled_route) > 0 and len(shelter_arr) > 0:
        print(f"DEBUG: Sample Route Pt: {sampled_route[0]}") # Expect [32.x, 35.x]
        print(f"DEBUG: Sample Shelter Pt: {shelter_arr[0]}") # Expect [32.x, 35.x]
    # ----------------------------

    # If NO shelters found, return 0 score but KEEP the points
    if shelter_arr.size == 0:
        return {
            "safetyScore": 0.0,
            "safetyReport": [{"p": p.tolist(), "d": 9999.0, "s": False} for p in sampled_route]
        }

    # 3. Vectorized Math
    distances_km = vectorized_haversine(sampled_route, shelter_arr)
    min_dist_km = np.min(distances_km, axis=1)
    
    # Check against 250m (0.25km)
    is_safe = min_dist_km <= 0.250
    score = (np.sum(is_safe) / len(sampled_route)) * 100.0

    # 4. JSON-Safe Report
    report = []
    for i in range(len(sampled_route)):
        report.append({
            "p": sampled_route[i].tolist(),
            "d": float(min_dist_km[i] * 1000),
            "s": bool(is_safe[i])
        })

    print(f"DEBUG: Final Score: {score}%")
    return {"safetyScore": round(score, 2), "safetyReport": report}

# Health check endpoint
@app.get("/")
def read_root():
    return {"status": "ok", "service": "SafeWay Logic Solver"}

@app.get("/health")
def health_check():
    return {"status": "online", "service": "logic-solver"}