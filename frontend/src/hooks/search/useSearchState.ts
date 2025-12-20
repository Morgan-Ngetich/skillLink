import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";

export const useSearchState = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlQuery = urlParams.get("q") || "";

  const [search, setSearchState] = useState(urlQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const isTypingRef = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync from URL to input when URL changes, but only if not typing or focused
  useEffect(() => {
    if (isFocused || isTypingRef.current) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(() => {
      if (search !== urlQuery) {
        setSearchState(urlQuery);
      }
    }, 100);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [urlQuery, isFocused, search]);

  // Track typing state on focus/blur
  useEffect(() => {
    if (isFocused) {
      isTypingRef.current = true;
    } else {
      const timer = setTimeout(() => {
        isTypingRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  const setSearch = useCallback((value: string) => {
    if (value === search) return; // avoid unnecessary updates
    isTypingRef.current = true;
    setSearchState(value);

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 1000);
  }, [search]);

  const submitSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    const newParams = new URLSearchParams(location.search);

    if (trimmed) newParams.set("q", trimmed);
    else newParams.delete("q");

    navigate({ to: "/explore", search: Object.fromEntries(newParams) });
    setSearchState(trimmed);
    isTypingRef.current = false;
  }, [location.search, navigate]);

  const clearSearch = useCallback(() => {
    setSearchState("");
    const newParams = new URLSearchParams(location.search);
    newParams.delete("q");
    navigate({ to: "/explore", search: Object.fromEntries(newParams) });
    isTypingRef.current = false;
  }, [location.search, navigate]);

  return {
    search,
    setSearch,
    isFocused,
    setIsFocused,
    dropdownVisible,
    setDropdownVisible,
    urlQuery,
    submitSearch,
    clearSearch,
  };
};
