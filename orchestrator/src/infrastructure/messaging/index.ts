import { kafkaClient, KAFKA_TOPICS } from "./config";
import { KafkaProducer } from "./KafkaProducer";
import { ResultConsumer } from "./ResultConsumer";
import { ablyService } from "../realtime/AblyService";
import { logger } from "../../middleware/logger";

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
    logger.warn({ event: 'MESSAGING_SKIPPED' }, 'Kafka client is not configured — messaging init skipped');
    return;
  }

  logger.info({ event: 'MESSAGING_INIT_START' }, 'Initializing messaging infrastructure');
  try {
    await kafkaRouteProducer.connect();
    await kafkaRouteConsumer.start();
    logger.info({ event: 'MESSAGING_ONLINE' }, 'Messaging infrastructure is online');
  } catch (err) {
    logger.error({ event: 'MESSAGING_INIT_ERROR', err }, 'Messaging infrastructure failed to start');
  }
};
