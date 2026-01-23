// Polyfill for node:async_hooks in browser
export class AsyncLocalStorage<T> {
  private store: T | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run<R>(store: T, callback: (...args: any[]) => R, ...args: any[]): R {
    this.store = store
    try {
      return callback(...args)
    } finally {
      this.store = undefined
    }
  }

  getStore(): T | undefined {
    return this.store
  }
}

export default { AsyncLocalStorage }