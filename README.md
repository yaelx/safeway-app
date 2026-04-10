# SafeWay Israel: Shelter-Aware Routing Engine
<img width="352" height="192" alt="image" src="https://github.com/user-attachments/assets/d634de2c-0a5c-4802-a087-42846be1dd40" />

**SafeWay** is a high-integrity navigation platform designed for high-tension environments. Unlike traditional GPS services that optimize solely for speed, SafeWay calculates transit paths based on **Shelter Density** and **Safe-Zone Proximity**, ensuring users are never more than a few seconds away from a protected space.

---

## System Architecture

The project utilizes an **Asynchronous Event-Driven Architecture** to handle heavy geospatial calculations without blocking the user interface.

The application has been refactored to handle complex routing calculations asynchronously. This ensures the frontend remains responsive even when performing heavy geospatial analysis (29+ shelter checks per route).

### 1. Frontend (React & Leaflet)
* **Real-time Visualization**: Renders safe/unsafe route segments using custom geo-spatial logic.
* **Dynamic Viewport Filtering**: Only fetches shelters within the user's active map bounds to optimize performance.
* **WebSocket Integration**: Uses Ably to listen for calculation results, providing a seamless "push" experience once the safety analysis is complete.

### 2. Orchestrator (Node.js & TypeScript)
* **Event Dispatcher**: Instead of waiting for the Python engine, the orchestrator validates requests and fires them into Aiven Kafka.
* **Security & Rate Limiting**: Implements a multi-tiered, **persistent rate-limiting strategy** using **Upstash Redis** to prevent API abuse and control cloud costs.
* **Data Validation**: Uses **Zod** for strict schema enforcement and coordinate transformation.
* **Real-time Gateway**: Manages Ably token generation and ensures results are routed back to the correct client session via unique correlationIds.

### 3. Logic Engine & Routing (Python & OSRM)
* **Kafka Consumer**: A multi-threaded background worker on GCP Cloud Run that "hunts" for route requests in the Kafka stream.
* **OSRM on Cloud Run**: A dedicated Open Source Routing Machine instance hosted on **Google Cloud Run**, utilizing **MLD (Multi-Level Dijkstra)** for rapid cold starts and Israel-specific OSM data baked directly into the container.
* **Safety Solver**: Performs vectorized Haversine math to cross-reference OSRM paths against verified public shelter coordinates.

---

## Tech Stack

* **Languages**: TypeScript, Python 3.10, SQL.
* **Event Streaming**: Aiven (Managed Kafka).
* **Real-time Pub/Sub**: Ably.
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
* **Memory**: 4GiB RAM / 2 CPU allocated on Cloud Run (Gen2).
* **Authentication**: Protected by **GCP IAM service accounts**.
* **Health Monitoring**: Dedicated FastAPI thread for Cloud Run uptime checks.

### The Event Loop
* **Node.js** receives a route request and produces a message to the route-requests topic in Aiven.
* **Python Worker** pulls the message, starts the OSRM process, and calculates the safety score.
* **Python Worker** produces the result to the route-results topic.
* **Node.js** consumes the result and pushes it to the user's browser via Ably.

---

## Running the Project

### 1. Environment Setup
Create a **.env** file in the **orchestrator** and **logic-server** directories with your GCP credentials, Upstash Redis URL, and Database connection strings.
* **Aiven**: Brokers, Username, Password, and CA Certificate.
* **Ably**: API Key.
* **Upstash**: Redis URL.

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
npm run start # Starts Kafka Producer and Ably Gateway
```

### 3. Logic Engine (Local Testing)
The heavy-lifting logic engine that calculates the safest path coordinates.
```bash
cd logic-server
pip install -r requirements.txt
python worker.py # Starts the Kafka Consumer and OSRM Engine
```

---

## Future Roadmap
* [x] OSRM Cloud Deployment: Dedicated Israel map engine on GCP.
* [x] Distributed Caching: Redis integration for high-traffic routes.
* [x] Infrastructure Hardening: Persistent rate limiting and Helmet security.
* [x] Event-Driven Refactor: Kafka integration for non-blocking calculations.
* [ ] Safety-Tradeoff Selectors: Toggles for "Shortest" vs. "Safest" routes.
* [ ] Community Sourcing: Google/Apple Auth for user-submitted shelter data.
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
```
<img width="2758" height="1570" alt="image" src="https://github.com/user-attachments/assets/9458be44-fd26-4b5d-bf44-dd7e37d270bd" />

