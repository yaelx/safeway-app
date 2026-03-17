---
trigger: always_on
---

# SafeWay Project: Safety Logic Rules

## 1. Safety Thresholds
- **Safe Distance**: A coordinate is considered "Safe" only if it is within **250 meters** of a verified shelter.
- **Sampling Rate**: To ensure performance, only analyze **every 10th point** (index % 10) of any provided route polyline.

## 2. Calculation Standards
- **Formula**: Use the **Haversine formula** for all GPS distance calculations.
- **Earth Radius**: Use **6371 km**.
- **Performance**: High-frequency calculations must be **vectorized** using NumPy.

## 3. Data Integrity
- All coordinates must be handled in **[lat, lng]** format for the final report.
- Shelters are sourced from GovMap Israel (x=lng, y=lat).