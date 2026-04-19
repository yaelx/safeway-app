import { Kafka, SASLOptions } from "kafkajs";
import dotenv from "dotenv";
import { logger } from "../../middleware/logger";


dotenv.config();

// 1. Safe extraction with fallback
const brokerStr = process.env.KAFKA_BROKERS;
const username = process.env.KAFKA_USERNAME;
const password = process.env.KAFKA_PASSWORD;

// 2. Validate essential data BEFORE initializing
const isKafkaConfigured = !!(brokerStr && username && password);

const sasl: SASLOptions | undefined = isKafkaConfigured
  ? { mechanism: "plain", username: username!, password: password! }
  : undefined;

// 3. Export a client that might be null, or a function that initializes it
export const kafkaClient = isKafkaConfigured
  ? new Kafka({
      clientId: "safeway-orchestrator",
      brokers: [brokerStr!],
      ssl: {
        rejectUnauthorized: false, // This tells Node to accept the self-signed cert
      },
      sasl,
      connectionTimeout: 15000, // Important for serverless/Vercel
      requestTimeout: 30000,
      retry: {
        initialRetryTime: 1000,
        retries: 3,
      },
    })
  : null;

if (!kafkaClient) {
  logger.warn(
    { event: 'KAFKA_CONFIG_MISSING', hasBroker: !!brokerStr, hasUsername: !!username, hasPassword: !!password },
    'Kafka configuration is incomplete — messaging features will be disabled',
  );
}

export const KAFKA_TOPICS = {
  REQUESTS: process.env.KAFKA_TOPIC_REQUESTS || "route-requests",
  RESULTS: process.env.KAFKA_TOPIC_RESULTS || "route-results",
};
