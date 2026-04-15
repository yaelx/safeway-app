export interface IKafkaProducer {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendRouteRequest(payload: any): Promise<void>;
  sendRouteResult(payload: any): Promise<void>;
}

export interface IKafkaConsumer {
  start(): Promise<void>;
  disconnect(): Promise<void>;
}
