"use client";

export interface QueuedAction {
  id: string;
  name: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

const STORAGE_KEY = "eh_offline_action_queue";

class OfflineQueueManager {
  private queue: QueuedAction[] = [];
  private listeners: Set<(queue: QueuedAction[], isOnline: boolean) => void> = new Set();
  private isOnline: boolean = typeof navigator !== "undefined" ? navigator.onLine : true;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadQueue();
      this.isOnline = navigator.onLine;

      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Storage unavailable or full
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
    this.flush();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  public subscribe(listener: (queue: QueuedAction[], isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.queue, this.isOnline);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.queue, this.isOnline));
  }

  public enqueue(name: string, payload: unknown): QueuedAction {
    const item: QueuedAction = {
      id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };
    this.queue.push(item);
    this.saveQueue();
    this.notify();
    return item;
  }

  public remove(id: string) {
    this.queue = this.queue.filter((item) => item.id !== id);
    this.saveQueue();
    this.notify();
  }

  public getSnapshot(): { queue: QueuedAction[]; isOnline: boolean } {
    return { queue: this.queue, isOnline: this.isOnline };
  }

  public async flush(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline || this.queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    const itemsToProcess = [...this.queue];
    let successCount = 0;
    let failedCount = 0;

    for (const item of itemsToProcess) {
      try {
        // Simulated graceful background flush execution
        await new Promise((resolve) => setTimeout(resolve, 300));
        this.remove(item.id);
        successCount++;
      } catch {
        item.retryCount++;
        failedCount++;
      }
    }

    this.saveQueue();
    this.notify();
    return { success: successCount, failed: failedCount };
  }
}

export const offlineQueue = new OfflineQueueManager();
