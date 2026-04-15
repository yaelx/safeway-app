import { kafkaClient, KAFKA_TOPICS } from "./config";
import { KafkaProducer } from "./KafkaProducer";
import { ResultConsumer } from "./ResultConsumer";
import { ablyService } from "../realtime/AblyService";

const GROUP_ID = "safeway-results-group";

export let kafkaRouteProducer: KafkaProducer | null = null;
export let kafkaRouteConsumer: ResultConsumer | null = null;

if (kafkaClient) {
  kafkaRouteProducer = new KafkaProducer(kafkaClient, {
    requestTopic: KAFKA_TOPICS.REQUESTS,
    resultTopic: KAFKA_TOPICS.RESULTS,
  });

  kafkaRouteConsumer = new ResultConsumer(
    kafkaClient,
    ablyService,
    KAFKA_TOPICS.RESULTS,
    GROUP_ID,
  );
}

export const initMessaging = async () => {
  if (!kafkaRouteProducer || !kafkaRouteConsumer) {
    console.warn(
      "⚠️ Skipping messaging initialization: Kafka client is not configured.",
    );
    return;
  }

  console.log("⏳ Initializing Messaging Infrastructure...");
  try {
    await kafkaRouteProducer.connect();
    await kafkaRouteConsumer.start();
    console.log("✅ Messaging Infrastructure Online");
  } catch (err) {
    console.error("❌ Messaging failed to start:", err);
  }
};
