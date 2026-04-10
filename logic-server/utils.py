import hashlib
from typing import List
from schemas.models import SegmentAnalysis

def generate_route_id(segments: List[SegmentAnalysis]) -> str:
    """
    Generates a unique, stable ID based on the route's geometry.
    segments: List of SegmentAnalysis objects
    """
    try:
        combined_path = "".join([s.geometry for s in segments])
        return hashlib.md5(combined_path.encode()).hexdigest()[:12]
    except Exception:
        # Fallback if hashing fails
        return f"route_{int(segments[0].duration) if segments else 'unknown'}"