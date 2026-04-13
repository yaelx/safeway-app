import { kafkaClient, KAFKA_TOPICS } from "./config";
import { KafkaProducer } from "./KafkaProducer";
import { ResultConsumer } from "./ResultConsumer";
import { ablyService } from "../realtime/AblyService";

const GROUP_ID = "safeway-results-group";

export const routeProducer = new KafkaProducer(kafkaClient, {
  requestTopic: KAFKA_TOPICS.REQUESTS,
  resultTopic: KAFKA_TOPICS.RESULTS,
});

export const routeResultConsumer = new ResultConsumer(
  kafkaClient,
  ablyService,
  KAFKA_TOPICS.RESULTS,
  GROUP_ID,
);

export const initMessaging = async () => {
  console.log("⏳ Initializing Messaging Infrastructure...");
  await routeProducer.connect();
  await routeResultConsumer.start();
  console.log("✅ Messaging Infrastructure Online");
};
