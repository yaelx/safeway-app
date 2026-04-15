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

## 🛠️ Architectural Challenges & Solutions
1. Persistent Event Consumption (Vercel ➔ Google Cloud Run)
* The Problem:
Initially, the Node.js orchestrator was deployed on Vercel. However, because Vercel functions follow a strict request-response lifecycle, the process was "frozen" or terminated immediately after sending a response to the frontend. This meant the Kafka Consumer was killed before it could receive the routing results back from the Python worker, breaking the real-time update loop via Ably.

* The Solution:
I migrated the Node.js orchestrator to Google Cloud Run using a containerized (Docker) approach. By selecting Instance-based billing (CPU Always Allocated), I ensured the server stays "awake" 24/7. This allows the Kafka consumer to maintain a consistent heartbeat with the Aiven broker and process incoming messages even when no active HTTP requests are occurring.

* The Result:
    * Reliability: The "return journey" of the data (Python ➔ Kafka ➔ Node ➔ Ably) is now guaranteed.
    * Latency: Using the me-west1 (Tel Aviv) region minimizes latency for local users in Israel.

2. Infrastructure Security & Secret Management
* The Problem:
Using a "Default" service account in Google Cloud provided too many broad permissions, creating a security risk. Furthermore, managing sensitive credentials like Kafka passwords and Ably keys in plain environment variables was not suitable for a production-grade application.

* The Solution:
    * Least Privilege: I created a dedicated Service Account with restricted access, granting only Secret Manager Secret Accessor and Logging Writer roles.
    * Secret Manager: All sensitive credentials were moved to GCP Secret Manager.

* The Result:
    * The application now follows industry-standard security protocols, ensuring that even if the service is compromised, the "blast radius" is limited to only the necessary resources.

3. Latency Optimization: Shifting from External API to Local Persistence
* The Problem:
During initial testing of the routing engine, I observed significant latency (up to 12 seconds) for a single request. Analysis of the server logs revealed a bottleneck in the geospatial data retrieval process:

* Log Evidence:

19:03:56: Initializing fetch from OpenStreetMap (OSM) Overpass API...

19:04:06: OSM Fetch timed out/failed; falling back to empty list.

* Diagnosis: The orchestrator was attempting to pull live shelter data from the public Overpass API for every request. This introduced a "double-jeopardy" scenario: we suffered from high latency (~10s) due to the external API's response time, and the system became unreliable when the public API rate-limited or timed out.

* The Solution:
I transitioned the architecture to a Local Persistence Model. Instead of real-time external fetching, the system now operates as follows:
Database Reliance: The routing logic now queries a local PostgreSQL database via Prisma. This reduced the data retrieval time from ~10,000ms to <50ms.
Decoupled Data Ingestion: To keep the data fresh without impacting user experience, I moved the OSM synchronization to a decoupled Seed/Cron script. This script populates the database once a week, ensuring the system has high-quality data without the real-time performance tax
Graceful Fallback: If the local database search returns insufficient results for a specific corridor, the system is designed to trigger a background update rather than making the user wait for a live external fetch.

* The Result:

End-to-End Latency: Reduced by over 95%.

Reliability: The system is no longer dependent on the uptime or rate-limits of third-party public APIs.

Predictability: Response times are now consistent, regardless of external network conditions.

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

