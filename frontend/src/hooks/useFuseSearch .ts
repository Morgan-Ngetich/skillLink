import { useMemo } from "react";
import Fuse, { type IFuseOptions, type FuseOptionKey, type FuseResult } from "fuse.js";
import type { Mentor } from "@/client/services/ment";

const searchableKeys = [
  "name",
  "title",
  "skills",
  "bio",
  "tags",
  "location",
  "rate",
  "badges",
] as const satisfies readonly (keyof Mentor)[];

export function useFuseSearch<T>(
  data: T[],
  searchQuery: string,
  options?: Omit<IFuseOptions<T>, "keys">
): FuseResult<T>[] {
  // Memoize the fuse instance with stable dependencies
  const fuse = useMemo(() => {
    const keys = searchableKeys.slice() as FuseOptionKey<T>[];
    const fuseOptions = {
      keys,
      threshold: 0.3,
      includeMatches: true,
      ...options,
    };
    return new Fuse(data, fuseOptions);
  }, [data, options]);

  // Memoize the results to avoid unnecessary re-renders
  const results = useMemo(() => {
    if (!searchQuery.trim()) {
      // fallback: no search term, return raw data wrapped as FuseResults
      return data.map((item, refIndex) => ({ item, refIndex }));
    } else {
      return fuse.search(searchQuery);
    }
  }, [searchQuery, fuse, data]);

  return results;
}