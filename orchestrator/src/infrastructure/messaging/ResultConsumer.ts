import { Kafka, Consumer, EachMessageHandler } from "kafkajs";
import { IRealtimeService } from "../realtime/types";
import { IKafkaConsumer } from "./types";

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

    // Defining the handler with strict EachMessageHandler type
    const handler: EachMessageHandler = async ({ message }) => {
      if (!message.value) return;

      try {
        const payload = JSON.parse(message.value.toString());
        const { requestId, routes } = payload;

        if (requestId && routes) {
          await this.realtime.publishResult(requestId, routes);
          await this.realtime.publishStatus(
            requestId,
            "completed",
            "Route analysis finished.",
          );
        }
      } catch (err) {
        console.error("❌ Failed to process Kafka message:", err);
      }
    };

    await this.consumer.run({ eachMessage: handler });
    console.log(`📡 Listening for results on: ${this.topic}`);
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}
