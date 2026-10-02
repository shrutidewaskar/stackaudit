import { UsageEvent } from "../types/types";

export class LocalEventQueue {
  private queue: UsageEvent[] = [];
  private maxRetries = 3;
  private retryDelayMs = 2000;
  private batchSize = 10;

  constructor() {
    this.loadQueue();
  }

  private loadQueue() {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem("stackaudit_usage_queue");
        if (stored) {
          this.queue = JSON.parse(stored);
        }
      } catch {
        this.queue = [];
      }
    }
  }

  private saveQueue() {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem("stackaudit_usage_queue", JSON.stringify(this.queue));
      } catch (err) {
        console.error("Failed to save local event queue:", err);
      }
    }
  }

  public enqueue(event: UsageEvent) {
    // Deduplication check
    const exists = this.queue.some((e) => e.eventId === event.eventId);
    if (!exists) {
      this.queue.push(event);
      this.saveQueue();
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public async processQueue(onUpload: (batch: UsageEvent[]) => Promise<boolean>): Promise<boolean> {
    if (this.queue.length === 0) return true;

    const batch = this.queue.slice(0, this.batchSize);
    let attempts = 0;
    let success = false;

    while (attempts < this.maxRetries && !success) {
      try {
        success = await onUpload(batch);
        if (success) {
          // Splice off processed batch
          this.queue = this.queue.slice(batch.length);
          this.saveQueue();
        } else {
          attempts++;
          if (attempts < this.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs));
          }
        }
      } catch {
        attempts++;
        if (attempts < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs));
        }
      }
    }

    return success;
  }
}

export const localEventQueue = new LocalEventQueue();
