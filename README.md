# SafeWay Israel: Shelter-Aware Routing Engine

**SafeWay** is a high-integrity navigation platform designed for high-tension environments. Unlike traditional GPS services that optimize solely for speed, SafeWay calculates transit paths based on **Shelter Density** and **Safe-Zone Proximity**, ensuring users are never more than a few seconds away from a protected space.

---

## System Architecture

The project is built as a **distributed microservices architecture** to ensure low latency and high reliability.

### 1. Frontend (React & Leaflet)
* **Real-time Visualization**: Renders safe/unsafe route segments using custom geo-spatial logic.
* **Dynamic Viewport Filtering**: Only fetches shelters within the user's active map bounds to optimize performance.

### 2. Orchestrator (Node.js & TypeScript)
* **Security & Rate Limiting**: Implements a multi-tiered, **persistent rate-limiting strategy** using **Upstash Redis** to prevent API abuse and control cloud costs.
* **Data Validation**: Uses **Zod** for strict schema enforcement and coordinate transformation.
* **Smart Caching**: Implements a caching layer for frequent route requests, reducing redundant calls to the OSRM engine.

### 3. Logic Engine & Routing (Python & OSRM)
* **OSRM on Cloud Run**: A dedicated Open Source Routing Machine instance hosted on **Google Cloud Run**, utilizing **MLD (Multi-Level Dijkstra)** for rapid cold starts and Israel-specific OSM data.
* **Safety Solver**: A Python-based FastAPI service that calculates **Safety Scores** by cross-referencing OSRM paths against a **PostgreSQL/PostGIS** database of verified public shelters.

---

## Tech Stack

* **Languages**: TypeScript, Python 3.10, SQL.
* **Backend**: Node.js (Express), FastAPI.
* **Infrastructure**: Google Cloud Platform (Cloud Run, Artifact Registry), Vercel.
* **Database & Caching**: PostgreSQL (Prisma ORM), **Upstash Redis**.
* **Routing**: OSRM (Israel PBF Extract).
* **Security**: Helmet, CORS, **OIDC Service-to-Service Authentication**.

---

## Infrastructure & Deployment

### OSRM Israel Engine (GCP)
The routing core is a dockerized OSRM instance pre-processed with Geofabrik OSM data.
* **Algorithm**: MLD for serverless efficiency.
* **Memory**: 2GiB RAM allocated on Cloud Run.
* **Authentication**: Protected by **GCP IAM service accounts**.

### Security Layers
* **Tiered Rate Limiting**: 
  * **General API**: 60 requests/min (PostgreSQL protection).
  * **Safe-Route Calculation**: 10 requests/min (OSRM/CPU protection).
* **Distributed Persistence**: Rate limits persist across serverless instances via Redis to prevent bypasses during cold starts.

---

## Running the Project

### 1. Environment Setup
Create a **.env** file in the **orchestrator** and **logic-server** directories with your GCP credentials, Upstash Redis URL, and Database connection strings.

### 2. Start the Services

#### Frontend
```bash
cd web-client
npm install
npm run dev
```

### 2. Orchestrator (Bridge & Security)
Handles data processing and serves as the bridge between the UI and the solver.
```bash
cd orchestrator
npm install
npm run start
```

### 3. Logic Engine (Local Testing)
The heavy-lifting logic engine that calculates the safest path coordinates.
```bash
cd logic-server
pip install -r requirements.txt
uvicorn solver:app --reload --port 8000
```

---

## Future Roadmap
* [x] OSRM Cloud Deployment: Dedicated Israel map engine on GCP.
* [x] Distributed Caching: Redis integration for high-traffic routes.
* [x] Infrastructure Hardening: Persistent rate limiting and Helmet security.
* [ ] Safety-Tradeoff Selectors: Toggles for "Shortest" vs. "Safest" routes.
* [ ] Community Sourcing: Google/Apple Auth for user-submitted shelter data.
* [ ] Safety-Tradeoff Selectors: Toggles for Shortest vs. Safest routes.
* [ ] Push Notifications: Real-time integration with Red Alert APIs.

---

### One Small Recommendation for your Node Setup:
Since you are using `npm run start` for the Node backend, make sure your `package.json` in the Node folder actually points to your entry file (like `location_resolver.ts` or `index.ts`). 

If you haven't set it up yet, you might want your `scripts` section to look like this:
```json
"scripts": {
  "start": "ts-node src/index.ts",
  "geocode": "ts-node src/scripts/location_resolver.ts"
}