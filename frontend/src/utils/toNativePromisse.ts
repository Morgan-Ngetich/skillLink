/**
 * Converts a CancelablePromise<T> into a regular (native) Promise<T>.
 *
 *   WHY WE USE THIS:
 * Some third-party libraries (like React Query) only work with
 * regular Promises. If we pass them a CancelablePromise, it won't work
 * properly, even though CancelablePromise looks similar.
 *
 * This helper acts as a bridge — it takes a CancelablePromise and wraps
 * it inside a native Promise, so we can still use our cancelable logic
 * internally but interact with external tools safely.
 *
 *NOTE: Use this when a library requires a real Promise.
 */
import { CancelablePromise } from "@/client";
export function toNativePromise<T>(cancelable: CancelablePromise<T>): Promise<T> {
  // Create and return a native Promise
  return new Promise<T>((resolve, reject) => {
    // When the cancelable promise resolves, resolve the native one too
    cancelable.then(resolve)
      // If the cancelable fails (or is canceled), reject the native one
      .catch(reject);
  });
}
