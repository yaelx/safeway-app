import { Kafka, Producer, CompressionTypes, Partitioners } from "kafkajs";
import { IKafkaProducer } from "./types";
import { logger } from "../../middleware/logger";

interface KafkaTopics {
  requestTopic: string;
  resultTopic: string;
}

export class KafkaProducer implements IKafkaProducer {
  private producer: Producer;
  private isConnected: boolean = false;

  constructor(
    private kafka: Kafka,
    private topics: KafkaTopics,
  ) {
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    try {
      await this.producer.connect();
      this.isConnected = true;
      logger.info({ event: 'KAFKA_PRODUCER_CONNECTED' }, 'Kafka Producer initialized and connected');
    } catch (error) {
      logger.error({ event: 'KAFKA_PRODUCER_CONNECT_ERROR', err: error }, 'Kafka Producer failed to connect');
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      logger.info({ event: 'KAFKA_PRODUCER_DISCONNECTED' }, 'Kafka Producer disconnected gracefully');
    } catch (error) {
      logger.error({ event: 'KAFKA_PRODUCER_DISCONNECT_ERROR', err: error }, 'Kafka Producer failed to disconnect cleanly');
      throw error;
    }
  }

  public async sendRouteRequest(data: any): Promise<void> {
    return this._publish(this.topics.requestTopic, data);
  }

  public async sendRouteResult(data: any): Promise<void> {
    return this._publish(this.topics.resultTopic, data);
  }

  private async _publish(topic: string, message: any): Promise<void> {
    // SAFETY CHECK: If the global init hasn't finished, ensure the request doesn't fail.
    if (!this.isConnected) await this.connect();

    try {
      await this.producer.send({
        topic,
        compression: CompressionTypes.GZIP,
        messages: [
          {
            key: message.userId || "system",
            value: JSON.stringify(message),
          },
        ],
      });
    } catch (err) {
      this.isConnected = false;
      throw err;
    }
  }
}
