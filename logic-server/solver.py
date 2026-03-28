from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import os
import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Header, HTTPException
from pathlib import Path
from dotenv import load_dotenv

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your specific Node Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Shelter(BaseModel):
    x: float  # lng
    y: float  # lat
    name: str = "Unknown Shelter"
    model_config = {"extra": "allow"}

class SafetyRequest(BaseModel):
    routes: List[List[List[float]]]  # list of [lat, lng]
    shelterData: List[Shelter]      # list of {x: lng, y: lat}

# ==========================================
# GLOBAL CONFIGURATION
# Change this value to adjust the safety distance
# ==========================================
SAFE_THRESHOLD_METERS = 500.0  
# ==========================================

EARTH_RADIUS_KM = 6371.0
SAFE_DISTANCE_KM = SAFE_THRESHOLD_METERS / 1000.0

# Set up logging to show in the terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Manually point to the .env file in the parent directory
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

INTERNAL_SECRET_TOKEN = os.getenv("INTERNAL_SECRET_TOKEN")

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
def evaluate_route(req: SafetyRequest, x_internal_token: str = Header(None)) -> Dict[str, Any]:
    logger.info(f"--- SOLVER CALLED | Points: {len(req.routePoints)} | Shelters: {len(req.shelterData)} ---")
    
    if x_internal_token != INTERNAL_SECRET_TOKEN:
        print("DEBUG: Token Mismatch!")
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    if not req.routePoints or not req.shelterData:
        return {"safetyScore": 0.0, "safetyReport": []}

    # 1. Prepare Route (Ensure Lat/Lng)
    route_array = np.array(req.routePoints)
    # If the first value is > 33, it's Lng. Swap to [Lat, Lng]
    if route_array[0][0] > 33:
        route_array = route_array[:, [1, 0]]
    
    sampled_route = route_array[::5]

    # 2. Prepare Shelters (Ensure Lat/Lng)
    # req.shelterData has {x: lng, y: lat}
    shelter_arr = np.array([[s.y, s.x] for s in req.shelterData])

    # --- CRITICAL DEBUG PRINT ---
    if len(sampled_route) > 0 and len(shelter_arr) > 0:
        print(f"DEBUG: Sample Route Pt: {sampled_route[0]}") # Expect [32.x, 35.x]
    # ----------------------------

    # If NO shelters found, return 0 score but KEEP the points
    if shelter_arr.size == 0:
        return {
            "safetyScore": 0.0,
            "safetyReport": [{"p": p.tolist(), "d": 9999.0, "s": False} for p in sampled_route]
        }

# 3. Vectorized Math
    distances_km = vectorized_haversine(sampled_route, shelter_arr)
    # Get the INDEX of the closest shelter for every route point
    closest_shelter_indices = np.argmin(distances_km, axis=1)
    min_dist_km = np.min(distances_km, axis=1)
    
    is_safe = min_dist_km <= SAFE_DISTANCE_KM
    score = (np.sum(is_safe) / len(sampled_route)) * 100.0
    
    # 4. JSON-Safe Report with Metadata Preservation
    report = []
    for i in range(len(sampled_route)):
        # Find the actual shelter object that was closest to this point
        closest_shelter = req.shelterData[closest_shelter_indices[i]]
        
        report.append({
            "p": sampled_route[i].tolist(),
            "d": float(min_dist_km[i] * 1000),
            "s": bool(is_safe[i]),
            # Merge the original shelter data back into the report point
            "shelter": closest_shelter.dict() 
        })

    return {"safetyScore": round(score, 2), "safetyReport": report}

@app.post("/evaluate_alternatives")
async def evaluate_alternatives(req: SafetyRequest, x_internal_token: str = Header(None)):
# 1. Security Check
    if x_internal_token != INTERNAL_SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    logger.info(f"Received {len(req.routes)} routes and {len(req.shelterData)} shelters")
    
    if not req.routes or not req.shelterData:
        return []

    # 2. Prepare Shelter Data once for all routes
    shelter_arr = np.array([[s.y, s.x] for s in req.shelterData])
    all_evaluated_routes = []

    # 3. Process each route candidate
    for route_index, original_points in enumerate(req.routes):
        route_array = np.array(original_points)
        
        # Ensure correct Lat/Lng order (assuming Israel coordinates)
        if route_array.size > 0 and route_array[0][0] > 33: # Coordinate swap logic
            route_array = route_array[:, [1, 0]]
        
        # Sample points for performance (every 5th point)
        sampled_route = route_array[::5]
        
        if len(sampled_route) == 0:
            continue

        # 4. Matrix Distance Calculation
        distances_km = vectorized_haversine(sampled_route, shelter_arr)
        
        # Find closest shelter for each sampled point
        min_dist_km = np.min(distances_km, axis=1)
        closest_shelter_indices = np.argmin(distances_km, axis=1)
        
        # Calculate safety
        is_safe_mask = min_dist_km <= SAFE_DISTANCE_KM
        safety_score = (np.sum(is_safe_mask) / len(sampled_route)) * 100.0
        
        # 5. Build detailed segment report
        report = []
        for i in range(len(sampled_route)):
            closest_shelter = req.shelterData[closest_shelter_indices[i]]
            report.append({
                "p": sampled_route[i].tolist(), # Point [lat, lng]
                "d": float(min_dist_km[i] * 1000), # Distance in meters
                "s": bool(is_safe_mask[i]), # Is safe?
                "shelter": closest_shelter.dict() # Metadata of nearest shelter
            })

        all_evaluated_routes.append({
            "routeIndex": route_index,
            "safetyScore": round(safety_score, 2),
            "safetyReport": report,
            "fullGeometry": original_points # Return for frontend rendering
        })

    # 6. Rank routes: Safest first
    all_evaluated_routes.sort(key=lambda x: x["safetyScore"], reverse=True)
    
    return all_evaluated_routes


# Health check endpoint
@app.post("/")
async def read_root(data: dict):
    return {"status": "ok", "service": "SafeWay Logic Solver"}

@app.get("/health")
def health_check():
    return {"status": "online", "service": "logic-solver"}