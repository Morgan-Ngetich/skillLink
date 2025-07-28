import { useMemo, useState, useEffect } from "react";
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
): FuseResult<T>[] { // key change
  const [results, setResults] = useState<FuseResult<T>[]>([]);
  const keys = searchableKeys.slice() as FuseOptionKey<T>[];

  const fuseOptions = useMemo(() => {
    return {
      keys,
      threshold: 0.3,
      includeMatches: true, // Required for accessing matched fields
      ...options,
    };
  }, [keys, options]);

  const fuse = useMemo(() => new Fuse(data, fuseOptions), [data, fuseOptions]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      // fallback: no search term, return raw data wrapped as FuseResults
      setResults(data.map((item, refIndex) => ({ item, refIndex })));
    } else {
      setResults(fuse.search(searchQuery));
    }
  }, [searchQuery, fuse, data]);

  return results; // Keep full FuseResult<T>[]
}
