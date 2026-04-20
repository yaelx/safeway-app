import os
from utils.logger import logger

def get_kafka_config():
    """Centralized configuration for Kafka."""
    brokers = os.getenv('KAFKA_BROKERS')
    username = os.getenv('KAFKA_USERNAME')
    password = os.getenv('KAFKA_PASSWORD')
    ca_cert = os.getenv('KAFKA_CA_CERT')
    
    if ca_cert and "\\n" in ca_cert:
        ca_cert = ca_cert.replace("\\n", "\n")

    if not all([brokers, username, password]):
        logger.error('kafka_secrets_missing', has_brokers=bool(brokers), 
                     has_username=bool(username), has_password=bool(password))
        raise ValueError("Missing Kafka environment variables")

    return {
        'bootstrap.servers': brokers,
        'security.protocol': 'SASL_SSL',
        'sasl.mechanism': 'SCRAM-SHA-256',
        'sasl.username': username,
        'sasl.password': password,
        'ssl.ca.pem': ca_cert,
        'ssl.endpoint.identification.algorithm': 'none',
        'api.version.request': True,
        'enable.ssl.certificate.verification': True
    }