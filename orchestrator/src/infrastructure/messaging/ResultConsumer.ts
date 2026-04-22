import { Kafka, Consumer, EachMessageHandler } from "kafkajs";
import { IRealtimeService } from "../realtime/types";
import { IKafkaConsumer } from "./types";
import { logger } from "../../middleware/logger";

export class ResultConsumer implements IKafkaConsumer {
  private consumer: Consumer;

  constructor(
    private kafka: Kafka,
    private realtime: IRealtimeService,
    private topic: string,
    groupId: string,
  ) {
    // groupID ensures that if you run multiple instances of Node,
    // each message is processed only once.
    this.consumer = this.kafka.consumer({
      groupId: groupId,
      sessionTimeout: 30000,
      rebalanceTimeout: 60000,
      heartbeatInterval: 3000,
    });
  }

  public async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });

    const handler: EachMessageHandler = async ({ message }) => {
      if (!message.value) return;

      let requestId: string | undefined;
      try {
        const payload = JSON.parse(message.value.toString());
        ({ requestId } = payload);
        const { routes } = payload;

        if (requestId && routes) {
          await this.realtime.publishResult(requestId, routes);
          await this.realtime.publishStatus(
            requestId,
            "completed",
            "Route analysis finished.",
          );
        }
      } catch (err) {
        logger.error({ event: 'KAFKA_MESSAGE_PROCESS_ERROR', requestId, err }, 'Failed to process incoming Kafka result message');
      }
    };

    await this.consumer.run({ eachMessage: handler });
    logger.info({ event: 'KAFKA_CONSUMER_READY', topic: this.topic }, 'Kafka ResultConsumer is listening');
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}
