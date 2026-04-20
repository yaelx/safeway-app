# main.py
from utils import generate_route_id
from typing import List
import subprocess
import os
import uvicorn
import hashlib
import json
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from solver import calculate_safety_for_geometry, analyze_route_segments
from schemas.models import SafetyRequest
from utils.logger import logger
from utils.exception_handlers import RequestIdMiddleware, global_exception_handler


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
# Attach request-ID middleware so every handler and the exception handler
# can access request.state.request_id for log correlation.
app.add_middleware(RequestIdMiddleware)

# --- GLOBAL EXCEPTION HANDLER ---
# Catches any exception that escapes a route handler.
# Logs the full trace internally; returns a clean error to the client.
app.add_exception_handler(Exception, global_exception_handler)

# --- START OSRM SUBPROCESS ---
# This launches the C++ engine using the data "baked" in the Dockerfile
# the path here should match the path in the Dockerfile
def start_osrm():
    global OSRM_READY
    try:
        logger.info('osrm_start')
        osrm_process = subprocess.Popen([
            "/usr/local/bin/osrm-routed", 
            "--algorithm", "mld", 
            "/app/data/israel-and-palestine-latest.osrm"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        logger.info('osrm_process_initiated')

        OSRM_READY = True
    except Exception as e:
        logger.error('osrm_start_error', exc_info=True)


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


@app.post("/evaluate_alternatives")
async def evaluate_alternatives(payload: dict):
    """
    Compare multiple routes (e.g., from the sidebar).
    Returns an array where each item is the full analysis of one candidate route.
    """
    request_obj = SafetyRequest(**payload)
    all_route_comparisons = []
    
    for route_item in request_obj.routes:
        analysis = analyze_route_segments(route_item, request_obj.shelterData)
        route_id = generate_route_id(analysis["segments"])
        
        all_route_comparisons.append({
            "index": route_item.index,
            "id": route_id,
            "safetyScore": analysis["score"],
            "segments": [s.model_dump() for s in analysis["segments"]],
            "geometry": route_item.geometry,
            "distance": route_item.distance,
            "duration": route_item.duration
        })
    
    # 4. Sort by highest safety score
    all_route_comparisons.sort(key=lambda x: x["safetyScore"], reverse=True)

    return {"requestId": request_obj.requestId, "routes": all_route_comparisons, "totalFound": len(all_route_comparisons), "timestamp": request_obj.timestamp, "status": "completed"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)

