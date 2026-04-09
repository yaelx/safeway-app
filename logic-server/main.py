# main.py
from typing import List
import subprocess
import os
import logging
import uvicorn
import hashlib
import json
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from solver import calculate_safety_for_geometry, analyze_route_segments
from schemas.models import SafetyRequest


# Set up logging to show in the terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
OSRM_READY = False

app = FastAPI()
# Setup Middleware ONCE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- START OSRM SUBPROCESS ---
# This launches the C++ engine using the data "baked" in the Dockerfile
# the path here should match the path in the Dockerfile
def start_osrm():
    global OSRM_READY
    try:
        print("DEBUG: Starting OSRM Engine...")
        osrm_process = subprocess.Popen([
            "/usr/local/bin/osrm-routed", 
            "--algorithm", "mld", 
            "/app/data/israel-and-palestine-latest.osrm"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        print("DEBUG: OSRM process initiated.")

        OSRM_READY = True
    except Exception as e:
        print(f"ERROR: Failed to start OSRM: {e}")


start_osrm()

@app.get("/health")
async def health():
    return {"status": "online", "engine": "OSRM MLD Active", "osrm_ready": OSRM_READY}



@app.get("/")
async def root():
    """Health check endpoint for Cloud Run."""
    return {
        "status": "online",
        "service": "SafeWay Logic Solver",
        "region": "Israel (me-west1)"
    }

@app.post("/evaluate_route")
async def evaluate_route(req: SafetyRequest):

    # We use the helper from solver.py
    result = calculate_safety_for_geometry(req.routes[0], req.shelterData)
    return {"safetyScore": result["score"], "safetyReport": result["report"]}


# @app.post("/evaluate_alternatives")
# async def evaluate_alternatives(req: SafetyRequest):
    
#     all_results = []
#     for idx, route_geom in enumerate(req.routes):
#         res = calculate_safety_for_geometry(route_geom, req.shelterData)
#         all_results.append({
#             "index": idx,
#             "safetyScore": res["score"],
#             "safetyReport": res["report"],
#             "geometry": route_geom
#         })
    
#     all_results.sort(key=lambda x: x["safetyScore"], reverse=True)
#     return all_results

def generate_route_id(segments):
    """
    Generates a unique, stable ID based on the route's geometry.
    segments: List of SegmentAnalysis objects
    """
    try:
        # Extract geometry from each segment to create a unique fingerprint
        # Since geometry might be a list or string, we convert to string
        combined_path = "".join([str(s.geometry) for s in segments])
        # Create a 12-character hex hash
        return hashlib.md5(combined_path.encode()).hexdigest()[:12]
    except Exception as e:
        # Fallback to a random-ish string if hashing fails
        return f"route_{int(segments[0].duration)}"


@app.post("/evaluate_alternatives")
async def evaluate_alternatives(req: List[SafetyRequest]):
    """
    Compare multiple routes (e.g., from the sidebar).
    Returns an array where each item is the full analysis of one candidate route.
    """
    all_route_comparisons = []
    
    for idx, route_req in enumerate(req):
        # We run the full segmented logic for each alternative
        analysis = analyze_route_segments(route_req) # {SegmentAnalysis, score}
        route_id = generate_route_id(analysis["segments"])
        all_route_comparisons.append({
            "index": idx,
            "id": route_id,
            "safetyScore": analysis["score"],
            # We still include segments so the frontend can color-code 
            # the alternative lines on the map if hovered.
            "segments": [s.model_dump() for s in analysis["segments"]]
        })
    
    # Sort them so the safest route is suggested first
    all_route_comparisons.sort(key=lambda x: x["safetyScore"], reverse=True)
    
    return {"routes": all_route_comparisons, "totalFound": len(all_route_comparisons)}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)

