import { Kafka, SASLOptions } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const brokers = [process.env.KAFKA_BROKER!];
const username = process.env.KAFKA_USERNAME!;
const password = process.env.KAFKA_PASSWORD!;

const sasl: SASLOptions | undefined =
  username && password ? { mechanism: "plain", username, password } : undefined;

// This is the underlying engine for both producing and consuming
export const kafkaClient = new Kafka({
  clientId: "safeway-orchestrator",
  brokers,
  ssl: !!sasl,
  sasl,
  retry: { initialRetryTime: 300, retries: 10 },
});

export const KAFKA_TOPICS = {
  REQUESTS: process.env.KAFKA_TOPIC_REQUESTS || "route-requests",
  RESULTS: process.env.KAFKA_TOPIC_RESULTS || "route-results",
};
