from utils import generate_route_id
import os
import json
import logging
import subprocess
import threading
import uvicorn
from fastapi import FastAPI
from confluent_kafka import Consumer, Producer
from solver import analyze_route_segments
from schemas.models import SafetyRequest

# --- 1. SETUP & LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
OSRM_READY = False

# --- 2. TINY FASTAPI FOR CLOUD RUN HEALTH CHECKS ---
app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "online", "engine": "OSRM MLD Active", "osrm_ready": OSRM_READY}


def handle_admin(payload):
    """Logic for administrative tasks"""
    action = payload.get("action")
    return {"admin_status": f"Processed {action} successfully"}

# --- 2. TASK HANDLERS ---
def handle_routing(payload):
    """Business logic for route evaluation"""
    requests = [SafetyRequest(**item) for item in payload]
    all_route_comparisons = []
    
    for idx, route_req in enumerate(requests):
        analysis = analyze_route_segments(route_req)
        route_id = generate_route_id(analysis["segments"])
        
        all_route_comparisons.append({
            "index": idx,
            "id": route_id,
            "safetyScore": analysis["score"],
            "segments": [s.model_dump() for s in analysis["segments"]]
        })
    
    all_route_comparisons.sort(key=lambda x: x["safetyScore"], reverse=True)
    return {"routes": all_route_comparisons, "totalFound": len(all_route_comparisons)}


# The Task Map links Topics to Functions
TASK_MAP = {
    "route-requests": handle_routing,
    "admin-tasks": handle_admin
}

# --- 3. KAFKA CORE ---
def run_kafka_consumer():
    conf = {
        'bootstrap.servers': os.getenv('KAFKA_BROKERS'),
        'security.protocol': 'SASL_SSL',
        'sasl.mechanism': 'SCRAM-SHA-256',
        'sasl.username': os.getenv('KAFKA_USERNAME'),
        'sasl.password': os.getenv('KAFKA_PASSWORD'),
        'ssl.ca.pem': os.getenv('KAFKA_CA_CERT'),
        'group.id': 'python-logic-server-group',
        'auto.offset.reset': 'earliest'
    }

    consumer = Consumer(conf)
    producer = Producer(conf)
    
    # Listen to BOTH topics
    consumer.subscribe(list(TASK_MAP.keys()))

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None: continue
            
            topic = msg.topic()
            try:
                raw_data = json.loads(msg.value().decode('utf-8'))
                correlation_id = raw_data.get('correlationId')
                payload = raw_data.get('payload')

                logger.info(f"Incoming task on topic: {topic} | ID: {correlation_id}")

                # Execute the correct function based on the topic
                handler = TASK_MAP.get(topic)
                if handler:
                    result_data = handler(payload)
                    
                    # Send result back to the results stream
                    result_message = {
                        "correlationId": correlation_id,
                        "originTopic": topic, # Let Node know where this came from
                        "data": result_data
                    }
                    producer.produce('route-results', value=json.dumps(result_message).encode('utf-8'))
                    producer.flush()
                else:
                    logger.warning(f"No handler found for topic: {topic}")

            except Exception as e:
                logger.error(f"Error in consumer loop: {e}")
    finally:
        consumer.close()



# --- 4. OSRM ENGINE START ---
def start_osrm():
    try:
        logger.info("Starting OSRM Engine...")
        subprocess.Popen([
            "/usr/local/bin/osrm-routed", 
            "--algorithm", "mld", 
            "/app/data/israel-and-palestine-latest.osrm"
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) # Keep logs clean
        logger.info("OSRM process initiated.")
    except Exception as e:
        logger.error(f"Failed to start OSRM: {e}")

# --- 5. EXECUTION ENTRYPOINT ---
if __name__ == "__main__":
    # Start OSRM first
    start_osrm()

    # Start Kafka Worker in a background thread
    kafka_thread = threading.Thread(target=run_kafka_consumer, daemon=True)
    kafka_thread.start()

    # Start FastAPI on the main thread to satisfy Cloud Run
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"Health check server listening on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)