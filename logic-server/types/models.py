# models.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Shelter(BaseModel):
    id: int
    lng: float 
    lat: float
    name: str = "Unknown Shelter"
    address: str = ""
    isOfficial: bool = False
    type: str = ""
    model_config = {"extra": "allow"}


class RoutePoint(BaseModel):
    coords: List[float]
    distance: float
    isSafe: bool
    shelter: Shelter

class Intersection(BaseModel):
    location: List[float] # [lng, lat]
    entry: List[bool]
    bearings: List[int]

class RouteStep(BaseModel):
    name: str
    ref: Optional[str] = None
    distance: float
    duration: float
    geometry: str
    intersections: List[Intersection]

class OSRMLeg(BaseModel):
    steps: List[RouteStep]
    distance: float
    duration: float

class SafetyRequest(BaseModel):
    # This matches the new Node.js request structure
    legs: List[OSRMLeg]
    shelterData: List[Shelter]

class SegmentAnalysis(BaseModel):
    type: str # "residential" | "highway"
    status: str # "safe" | "exposed" | "caution"
    text: str
    segmentScore: float # The relative score you asked for
    duration: float
    shelters: List[Shelter] = []
    escapePoint: Optional[Dict[str, Any]] = None