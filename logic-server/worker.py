import time
from utils import generate_route_id
import os
import json
import subprocess
import functools
import threading
import uvicorn
from fastapi import FastAPI, Request
from confluent_kafka import Consumer, Producer
from solver import analyze_route_segments
from schemas.models import SafetyRequest
from utils.logger import logger
from utils.decorators import timer
from utils.exception_handlers import RequestIdMiddleware, global_exception_handler

# --- 1. SETUP ---
OSRM_READY = False

# --- 2. TINY FASTAPI FOR CLOUD RUN HEALTH CHECKS ---
app = FastAPI()
app.add_middleware(RequestIdMiddleware)
app.add_exception_handler(Exception, global_exception_handler)


@timer
@app.get("/health")
async def health():
    return {"status": "online", "engine": "OSRM MLD Active", "osrm_ready": OSRM_READY}


def handle_admin(payload):
    """Logic for administrative tasks"""
    action = payload.get("action")
    return {"admin_status": f"Processed {action} successfully"}

# --- 2. TASK HANDLERS ---
@timer
def handle_routing(payload: dict):
    """
    Business logic for route evaluation.
    Expects payload_dict containing 'requestId', 'routes', and 'shelterData'.
    """
    request_id = payload.get("requestId", "unknown")
    log = logger.bind(requestId=request_id)
    try:
        request_obj = SafetyRequest.model_validate(payload)
    except Exception as e:
        log.error('validation_error', exc_info=True)
        return {"status": "error", "message": str(e)}
        
    all_route_comparisons = []
    log.info('analyzing_routes', count=len(request_obj.routes))
    
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

    return {"requestId": request_id, "routes": all_route_comparisons, "totalFound": len(all_route_comparisons), "timestamp": request_obj.timestamp, "status": "completed"}


# The Task Map links Topics to Functions
TASK_MAP = {
    "route-requests": handle_routing,
    # "admin-tasks": handle_admin
}

# --- 3. KAFKA CORE ---
@timer
def run_kafka_consumer():
# Fetch variables
    brokers = os.getenv('KAFKA_BROKERS')
    username = os.getenv('KAFKA_USERNAME')
    password = os.getenv('KAFKA_PASSWORD')
    ca_cert = os.getenv('KAFKA_CA_CERT')
    if ca_cert and "\\n" in ca_cert:
        ca_cert = ca_cert.replace("\\n", "\n")

    # SENIOR CHECK: Validate before creating the consumer
    if not all([brokers, username, password]):
        logger.error(
            'kafka_secrets_missing',
            has_brokers=bool(brokers),
            has_username=bool(username),
            has_password=bool(password),
        )
        return

    conf = {
        'bootstrap.servers': brokers,
        'security.protocol': 'SASL_SSL',
        'sasl.mechanism': 'SCRAM-SHA-256',
        'sasl.username': username,
        'sasl.password': password,
        'ssl.ca.pem': ca_cert,
        'group.id': 'CONSUMER_GROUP_ID',
        'auto.offset.reset': 'earliest',
        'ssl.endpoint.identification.algorithm': 'none',
        'api.version.request': True,
        'enable.ssl.certificate.verification': True
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
                decoded_msg = msg.value().decode('utf-8')
                # 2. Skip empty messages (Tombstones)
                if not decoded_msg or decoded_msg.strip() == "":
                    logger.warning('empty_message_received')
                    continue

                try:
                    raw_data = json.loads(decoded_msg)
    
                except json.JSONDecodeError:
                    logger.error('malformed_json', raw_preview=decoded_msg[:200])
                    continue

                payload = raw_data.get('payload', raw_data)
                correlation_id = raw_data.get('correlationId', payload.get('requestId', 'unknown'))

                if payload is None:
                    logger.warning('empty_payload', correlation_id=correlation_id)
                    continue

                logger.info('task_received', topic=topic, correlation_id=correlation_id)

                # Execute the correct function based on the topic
                handler = TASK_MAP.get(topic)
                if handler:
                    result_data = handler(payload)
                    # Send the result_data directly so Node can destructure it easily
                    producer.produce('route-results', value=json.dumps(result_data).encode('utf-8'))
                    producer.flush()
                else:
                    logger.warning('no_handler_for_topic', topic=topic)

            except Exception as e:
                logger.error('consumer_loop_error', exc_info=True)
    finally:
        consumer.close()



# --- 4. OSRM ENGINE START ---
def start_osrm():
    global OSRM_READY
    # This is the verified path in the Alpine OSRM image
    executable = "/usr/local/bin/osrm-routed" 
    map_path = "/app/data/israel-and-palestine-latest.osrm"

    osrm_args = [executable, "--algorithm", "mld", map_path]

    try:
        logger.info('osrm_start', executable=executable)
        
        process = subprocess.Popen(
            osrm_args,
            stdout=None, 
            stderr=None
        )
        
        time.sleep(5) 
        
        if process.poll() is None:
            logger.info('osrm_ready')
            OSRM_READY = True
        else:
            logger.error('osrm_failed', exit_code=process.poll())
            
    except Exception as e:
        logger.error('osrm_launch_error', exc_info=True)


# --- 5. EXECUTION ENTRYPOINT ---
if __name__ == "__main__":
    # Start OSRM first
    start_osrm()

    # Start Kafka Worker in a background thread
    kafka_thread = threading.Thread(target=run_kafka_consumer, daemon=True)
    kafka_thread.start()

    # Start FastAPI on the main thread to satisfy Cloud Run
    port = int(os.environ.get("PORT", 8080))
    logger.info('health_server_start', port=port)
    uvicorn.run(app, host="0.0.0.0", port=port)