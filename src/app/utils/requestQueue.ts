/**
 * Request Queue Manager - Handle concurrent requests efficiently
 * Prevents overwhelming server with simultaneous requests from multiple users
 */

type QueuedRequest = {
  id: string;
  fn: () => Promise<any>;
  priority: number;
  timestamp: number;
  retries: number;
};

class RequestQueueManager {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private maxConcurrent = 3; // Max 3 concurrent requests
  private activeRequests = 0;
  private requestMap = new Map<string, Promise<any>>();

  /**
   * Add request to queue with deduplication
   */
  async enqueue<T>(
    id: string,
    fn: () => Promise<T>,
    priority: number = 5
  ): Promise<T> {
    // 🔥 DEDUPLICATION: If same request is in progress, return existing promise
    if (this.requestMap.has(id)) {
      console.log(`🔄 Request ${id} already in progress, reusing...`);
      return this.requestMap.get(id)! as Promise<T>;
    }

    const request: QueuedRequest = {
      id,
      fn,
      priority,
      timestamp: Date.now(),
      retries: 0,
    };

    // Add to queue (sorted by priority)
    this.queue.push(request);
    this.queue.sort((a, b) => b.priority - a.priority);

    console.log(`📥 Queued request ${id} (priority: ${priority})`);

    // Create promise that resolves when request completes
    const promise = new Promise<T>((resolve, reject) => {
      const checkAndExecute = async () => {
        while (true) {
          // Wait for slot to be available - ULTRA FAST!
          if (this.activeRequests >= this.maxConcurrent) {
            await new Promise(r => setTimeout(r, 50)); // 50ms (dikurangi dari 100ms)
            continue;
          }

          // Find our request in queue
          const index = this.queue.findIndex(r => r.id === id);
          if (index === -1) {
            // Already processed or removed
            return;
          }

          // Execute request
          this.activeRequests++;
          const req = this.queue[index];
          this.queue.splice(index, 1);

          console.log(`⚡ Executing request ${id} (${this.activeRequests}/${this.maxConcurrent} active)`);

          try {
            const result = await req.fn();
            this.requestMap.delete(id);
            resolve(result);
          } catch (error) {
            this.requestMap.delete(id);
            reject(error);
          } finally {
            this.activeRequests--;
          }
          break;
        }
      };

      checkAndExecute();
    });

    this.requestMap.set(id, promise);
    return promise;
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queued: this.queue.length,
      active: this.activeRequests,
      total: this.queue.length + this.activeRequests,
    };
  }

  /**
   * Clear queue (emergency)
   */
  clear() {
    this.queue = [];
    this.requestMap.clear();
    console.log('🗑️ Queue cleared');
  }

  /**
   * Clear specific request from cache
   */
  clearPattern(pattern: string) {
    let cleared = 0;
    for (const key of this.requestMap.keys()) {
      if (key.includes(pattern)) {
        this.requestMap.delete(key);
        cleared++;
      }
    }
    console.log(`🗑️ Cleared ${cleared} cached requests matching: ${pattern}`);
  }
}

export const requestQueue = new RequestQueueManager();
