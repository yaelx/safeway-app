# 🛡️ SafeWay Israel: Shelter-Aware Routing Engine

**SafeWay** is a specialized navigation platform designed for high-tension environments. Unlike traditional GPS services that optimize solely for speed, SafeWay calculates transit paths based on **Shelter Density** and **Safe-Zone Proximity**, ensuring users are never more than a few seconds away from a protected space.

---

## 🚀 Core Features

### 📍 Intelligent Safety Routing
* **Shelter-Agnostic Pathfinding**: Analyzes OSRM paths against a geo-spatial database of public shelters.
* **Safety Thresholding**: Identifies "Blind Spots" where shelter access exceeds safe sprint times.
* **Real-time Recalculation**: Adjusts routes dynamically based on user selection.

### 🗺️ Geo-Spatial Visualization
* **Dynamic Shelter Discovery**: Renders verified shelters within the active viewport.
* **Segmented Route UI**: Visualizes safety levels (Green/Red) along the path.
* **GPS Integration**: High-accuracy "Locate Me" functionality.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Leaflet, Material UI Icons.
* **Orchestrator (Node.js)**: API management, Geocoding pipelines, and Data seeding.
* **Logic Engine (Python)**: FastAPI, Uvicorn, and custom path-solving algorithms.
* **Routing**: OSRM (Open Source Routing Machine).

---

## ⚙️ Running the Project

To run the full stack, you will need three terminal instances open:

### 1. Frontend (React)
Handles the interactive map and user search interface.
```bash
cd web-client
npm install
npm run dev
```

### 2. Orchestrator (Node.js)
Handles data processing and serves as the bridge between the UI and the solver.
```bash
cd orchestrator
npm install
npm run start
```

### 3. Logic Engine (Python)
The heavy-lifting logic engine that calculates the safest path coordinates.
```bash
cd logic-server
pip install -r requirements.txt
uvicorn solver:app --reload --port 8000
```

---

## ⚙️ Future Roadmap
* Safety-Tradeoff Selectors: Toggles for "Shortest" vs. "Safest" routes.

* Community Sourcing: Google/Apple Auth for user-submitted shelter data.

* Persistent History: LocalStorage/Redis caching for frequent destinations.

* Push Notifications: Integration with Red Alert APIs.

---

### One Small Recommendation for your Node Setup:
Since you are using `npm run start` for the Node backend, make sure your `package.json` in the Node folder actually points to your entry file (like `location_resolver.ts` or `index.ts`). 

If you haven't set it up yet, you might want your `scripts` section to look like this:
```json
"scripts": {
  "start": "ts-node src/index.ts",
  "geocode": "ts-node src/scripts/location_resolver.ts"
}