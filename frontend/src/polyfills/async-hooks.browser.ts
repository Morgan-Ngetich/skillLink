// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class AsyncLocalStorage<T = any> {
  private store: T | undefined = undefined;

  getStore(): T | undefined {
    return this.store;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run<R>(store: T, callback: (...args: any[]) => R, ...args: any[]): R {
    const previousStore = this.store;
    this.store = store;
    try {
      return callback(...args);
    } finally {
      this.store = previousStore;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exit<R>(callback: (...args: any[]) => R, ...args: any[]): R {
    const previousStore = this.store;
    this.store = undefined;
    try {
      return callback(...args);
    } finally {
      this.store = previousStore;
    }
  }

  enterWith(store: T): void {
    this.store = store;
  }

  disable(): void {
    this.store = undefined;
  }
}

export const createHook = () => ({
  enable: () => { },
  disable: () => { },
});

export const executionAsyncId = () => 0;
export const triggerAsyncId = () => 0;
export const executionAsyncResource = () => ({});

// ✅ Add default export for compatibility
export default {
  AsyncLocalStorage,
  createHook,
  executionAsyncId,
  triggerAsyncId,
  executionAsyncResource,
};