/**
 * Retry utility for network requests
 * Implements exponential backoff for failed requests
 */

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  timeout?: number;
}

const defaultConfig: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  timeout: 30000, // 30 seconds
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay, timeout } = { ...defaultConfig, ...config };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to the request
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
      ]);
      return result;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Wait for online connection
 */
export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
}

/**
 * Batch requests to reduce network calls
 */
export class RequestBatcher<T> {
  private queue: Array<{
    resolve: (value: T) => void;
    reject: (error: any) => void;
  }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchDelay: number;

  constructor(
    private batchFn: (items: number) => Promise<T[]>,
    batchDelay: number = 100
  ) {
    this.batchDelay = batchDelay;
  }

  add(): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => this.flush(), this.batchDelay);
    });
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const currentQueue = [...this.queue];
    this.queue = [];

    try {
      const results = await this.batchFn(currentQueue.length);
      currentQueue.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      currentQueue.forEach((item) => item.reject(error));
    }
  }
}

/**
 * Compress data before sending (simple JSON minification)
 */
export function compressData(data: any): string {
  return JSON.stringify(data);
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
