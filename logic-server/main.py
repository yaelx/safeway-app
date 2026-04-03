# main.py
import subprocess
import time
import os
import requests
import numpy as np
import logging
import uvicorn
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from solver import SafetyRequest, calculate_safety_for_geometry

# Set up logging to show in the terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
try:
    print("DEBUG: Starting OSRM Engine...")
    osrm_process = subprocess.Popen([
        "/usr/local/bin/osrm-routed", 
        "--algorithm", "mld", 
        "/app/data/israel-and-palestine-latest.osrm"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    print("DEBUG: OSRM process initiated.")
except Exception as e:
    print(f"ERROR: Failed to start OSRM: {e}")

# Give it time, but don't block the whole app if it takes longer
time.sleep(5)

@app.get("/health")
async def health():
    return {"status": "online", "engine": "OSRM MLD Active"}



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


@app.post("/evaluate_alternatives")
async def evaluate_alternatives(req: SafetyRequest):
    
    all_results = []
    for idx, route_geom in enumerate(req.routes):
        res = calculate_safety_for_geometry(route_geom, req.shelterData)
        all_results.append({
            "index": idx,
            "safetyScore": res["score"],
            "safetyReport": res["report"],
            "geometry": route_geom
        })
    
    all_results.sort(key=lambda x: x["safetyScore"], reverse=True)
    return all_results


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)

