import { useMemo } from "react";
import Fuse, { type IFuseOptions, type FuseResult } from "fuse.js";

/**
 * Generic Fuse.js search hook that works with any data type
 * @param data - Array of items to search through
 * @param searchQuery - Search term
 * @param options - Fuse.js options including keys to search
 */
export function useFuseSearch<T>(
  data: T[],
  searchQuery: string,
  options?: IFuseOptions<T>
): FuseResult<T>[] {
  // Memoize the fuse instance
  const fuse = useMemo(() => {
    const fuseOptions: IFuseOptions<T> = {
      threshold: 0.3,
      includeMatches: true,
      minMatchCharLength: 2,
      ...options,
    };
    return new Fuse(data, fuseOptions);
  }, [data, options]);

  // Memoize the results
  const results = useMemo(() => {
    if (!searchQuery.trim()) {
      // No search term: return raw data wrapped as FuseResults
      return data.map((item, refIndex) => ({ 
        item, 
        refIndex,
        score: 1,
        matches: []
      }));
    }
    return fuse.search(searchQuery);
  }, [searchQuery, fuse, data]);

  return results;
}