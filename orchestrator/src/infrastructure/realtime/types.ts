export interface IRealtimeService {
  publishStatus(
    requestId: string,
    status: "processing" | "completed" | "failed",
    message: string,
  ): Promise<void>;
  publishResult(requestId: string, data: any): Promise<void>;
}
