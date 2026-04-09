# solver.py
import numpy as np
import os
import logging
import polyline
from typing import List, Dict, Any
from schemas.models import SafetyRequest, RouteStep, SegmentAnalysis, Shelter, RoutePoint
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

SAFE_THRESHOLD_METERS = 500.0  
EARTH_RADIUS_KM = 6371.0
SAFE_DISTANCE_KM = SAFE_THRESHOLD_METERS / 1000.0
    
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
    shelter_arr = np.array([[s.lat, s.lng] for s in shelters])
    
    dist_matrix = vectorized_haversine(sampled, shelter_arr)
    min_dists = np.min(dist_matrix, axis=1)
    indices = np.argmin(dist_matrix, axis=1)
    
    is_safe = min_dists <= SAFE_DISTANCE_KM
    score = (np.sum(is_safe) / len(sampled)) * 100.0
    
    report: List[RoutePoint] = []
    for i in range(len(sampled)):
        report.append({
            "coords": sampled[i].tolist(),
            "distance": float(min_dists[i] * 1000),
            "isSafe": bool(is_safe[i]),
            "shelter": shelters[indices[i]].dict()
        })
    return {"score": round(score, 2), "report": report}

def analyze_route_segments(req: SafetyRequest):
    """
    Calculates safety for ONE route by breaking it into 
    context-aware segments (Highway vs Residential).
    """
    segments = []
    weighted_score_sum = 0
    total_duration = 0
    shelter_arr = np.array([[s.lat, s.lng] for s in req.shelterData])

    for leg in req.legs:
        for i, step in enumerate(leg.steps):
            total_duration += step.duration
            
            # --- HIGHWAY RELATIVE SCORING ---
            if step.ref and any(r in step.ref for r in ["2", "4", "6", "22", "70", "75"]):
                # Highway score: Penalty grows after 60s of exposure
                h_score = max(0, min(100, 100 - (step.duration - 60) * 0.8))
                
                # Iran-Profile Escape Logic
                escape = None
                if i + 1 < len(leg.steps):
                    next_s = leg.steps[i+1]
                    escape = {
                        "lat": next_s.intersections[0].location[1],
                        "lng": next_s.intersections[0].location[0],
                        "name": f"Exit to {next_s.name}"
                    }

                seg = SegmentAnalysis(
                    type="highway",
                    status="exposed" if h_score < 50 else "caution",
                    segmentScore=round(h_score, 2),
                    text=f"Road {step.ref}: {int(step.duration)}s exposure.",
                    duration=step.duration,
                    escapePoint=escape
                )

            # --- RESIDENTIAL RELATIVE SCORING ---
            else:
                coords = polyline.decode(step.geometry)
                if not coords: continue
                
                step_pts = np.array(coords)
                # Sample every 3rd point to keep speed high
                dist_matrix = vectorized_haversine(step_pts[::3], shelter_arr)
                
                # Residential score: % of path within 500m of a shelter
                safe_ratio = np.mean(np.min(dist_matrix, axis=1) < SAFE_DISTANCE_KM)
                r_score = safe_ratio * 100
                
                # Fetch only a few nearby shelters to keep response light
                nearby_idx = np.where(np.min(dist_matrix, axis=0) < SAFE_DISTANCE_KM)[0]
                nearby_shelters = [req.shelterData[idx] for idx in nearby_idx[:3]]

                seg = SegmentAnalysis(
                    type="residential",
                    status="safe" if r_score > 70 else "exposed",
                    segmentScore=round(r_score, 2),
                    text=f"{step.name}: {len(nearby_shelters)} shelters nearby.",
                    duration=step.duration,
                    shelters=nearby_shelters
                )

            segments.append(seg)
            weighted_score_sum += (seg.segmentScore * step.duration)

    final_route_score = weighted_score_sum / total_duration if total_duration > 0 else 0
    return {"score": round(final_route_score, 2), "segments": segments}