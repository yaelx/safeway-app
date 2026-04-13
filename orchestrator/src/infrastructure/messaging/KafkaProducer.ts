import { Kafka, Producer, CompressionTypes, SASLOptions } from "kafkajs";
import { IKafkaProducer } from "./types";

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
    this.producer = this.kafka.producer();
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log("✅ Kafka Producer initialized and connected");
    } catch (error) {
      console.error("❌ Kafka Connection Error:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log("🔌 Kafka Producer disconnected safely");
    } catch (error) {
      console.error("❌ Kafka Disconnect Error:", error);
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
