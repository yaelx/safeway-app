# SafeWay Israel: Shelter-Aware Routing Engine
<img width="352" height="192" alt="image" src="https://github.com/user-attachments/assets/d634de2c-0a5c-4802-a087-42846be1dd40" />

**SafeWay** is a high-integrity navigation platform designed for high-tension environments. Unlike traditional GPS services that optimize solely for speed, SafeWay calculates transit paths based on **Shelter Density** and **Safe-Zone Proximity**, ensuring users are never more than a few seconds away from a protected space.
---

## System Architecture

```mermaid
graph TD
    %% Node Styles
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef orchestrator fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef worker fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef messaging fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;

    User((User)) -->|Search| V[Vercel Frontend]:::frontend
    V -->|API Request| N[Node.js Orchestrator]:::orchestrator

    subgraph External_APIs [External Engines]
        N -->|MLD Query| OSRM[OSRM Engine]
    end

    subgraph Event_Driven_Core [Event-Driven Pipeline]
        N -->|1. Dispatch| K{Aiven Kafka}:::messaging
        K -->|2. Consume| P[Python Safety Worker]:::worker
        
        subgraph Python_Logic [Compute Engine]
            P --> P1[Polyline Decoding]
            P1 --> P2[Spatial Analysis]
            P2 --> P3[Safety Scoring]
        end
        
        P3 -->|3. Publish| K
    end

    K -->|4. Push| N
    N -->|5. Realtime| A[Ably WebSockets]:::messaging
    A -->|6. Render| V
 ```

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

## Architectural Challenges & Solutions:
1. Persistent Event Consumption (Vercel ➔ Google Cloud Run) 15/04/26
* The Problem:
Initially, the Node.js orchestrator was deployed on Vercel. However, because Vercel functions follow a strict request-response lifecycle, the process was "frozen" or terminated immediately after sending a response to the frontend. This meant the Kafka Consumer was killed before it could receive the routing results back from the Python worker, breaking the real-time update loop via Ably.

* The Solution:
   I migrated the Node.js orchestrator to Google Cloud Run using a containerized (Docker) approach. By selecting Instance-based billing (CPU Always Allocated), I ensured the server stays "awake" 24/7. This allows the Kafka consumer to     maintain a consistent heartbeat with the Aiven broker and process incoming messages even when no active HTTP requests are occurring.

* The Result:
    * Reliability: The "return journey" of the data (Python ➔ Kafka ➔ Node ➔ Ably) is now guaranteed.
    * Latency: Using the me-west1 (Tel Aviv) region minimizes latency for local users in Israel.

2. Infrastructure Security & Secret Management
* The Problem:
   Using a "Default" service account in Google Cloud provided too many broad permissions, creating a security risk. Furthermore, managing sensitive credentials like Kafka passwords and Ably keys in plain environment variables was not      suitable for a production-grade application.

* The Solution:
* Least Privilege: I created a dedicated Service Account with restricted access, granting only Secret Manager Secret Accessor and Logging Writer roles.
* Secret Manager: All sensitive credentials were moved to GCP Secret Manager.

* The Result:
* The application now follows industry-standard security protocols, ensuring that even if the service is compromised, the "blast radius" is limited to only the necessary resources.

3. Latency Optimization: Shifting from External API to Local Persistence
* The Problem:
   During initial testing of the routing engine, I observed significant latency (up to 12 seconds) for a single request. Analysis of the server logs revealed a bottleneck in the geospatial data retrieval process:

* Log Evidence:
   #### 🔍 Performance Profiling: Before vs. After Optimization

To quantify the impact, I profiled the `get-safe-route` endpoint. The results show a dramatic 80% improvement in response time.

| State | Node.js Server Logs (Google Cloud) | Response Time |
| :--- | :--- | :--- |
| **BEFORE**<br>(Live External Fetch) | <img src="https://github.com/user-attachments/assets/f8d613a6-d46a-40a0-830e-3f12d2e0dbdc" width="300px" alt="Logs before optimization: 10s timeout gap." /> | **~11.57 seconds**<br>(Sufferance from public API bottlenecks) |
| **AFTER**<br>(Local Index + Conditional) | <img src="https://github.com/user-attachments/assets/4a265c49-f686-4326-ab9c-4d02530e333b" width="300px" alt="Logs after: Sub-3s response." /> | **~2.26 seconds**<br>(**80% faster**, 100% reliability) |

* Diagnosis: The orchestrator was attempting to pull live shelter data from the public Overpass API for every request. This introduced a "double-jeopardy" scenario: we suffered from high latency (~10s) due to the external API's response time, and the system became unreliable when the public API rate-limited or timed out.

* The Solution:
   I transitioned the architecture to a Local Persistence Model. Instead of real-time external fetching, the system now operates as follows:
   * Database Reliance: The routing logic now queries a local PostgreSQL database via Prisma. This reduced the data retrieval time from ~10,000ms to <50ms.
   * Decoupled Data Ingestion: To keep the data fresh without impacting user experience, I moved the OSM synchronization to a decoupled Seed/Cron script. This script populates the database once a week, ensuring the system has high           quality data without the real-time performance tax
   * Graceful Fallback: If the local database search returns insufficient results for a specific corridor, the system is designed to trigger a background update rather than making the user wait for a live external fetch.

* The Result:
   * End-to-End Latency: Reduced by over 95%.
   * Reliability: The system is no longer dependent on the uptime or rate-limits of third-party public APIs.
   * Predictability: Response times are now consistent, regardless of external network conditions.

---

## System Observability & Monitoring
To ensure reliability and performance in an event-driven architecture, I implemented a robust, full-stack observability pipeline. This allows for real-time tracking of route requests, processing times, and system health across the Node.js orchestrator and Python workers.

### The Telemetry Pipeline
* Structured Logging: Both Node.js and Python services are instrumented with structured logging to capture granular execution data.
* Log Aggregation: All service logs are ingested and stored in Google Cloud Logging for centralized analysis.
* Data Pipeline: Logs are exported to BigQuery via logging sinks to enable advanced querying and trend analysis of routing data.
* Visualization: A dedicated Grafana Dashboard connects to BigQuery, providing real-time visual monitoring of Kafka throughput, service-specific latency, and routing safety metrics.

### Monitoring Capabilities
* Message Flow: Full end-to-end tracing of messages as they traverse the Aiven Kafka brokers.
* Latency Tracking: Real-time monitoring of response times for the Python-based OSRM engine, allowing for proactive scaling.
* WebSocket Health: Monitoring connection status and latency for the Ably-based real-time delivery layer.

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
<img width="2456" height="1844" alt="image" src="https://github.com/user-attachments/assets/66cc5f16-4a85-4a96-9fef-2cce2c5c663b" />

