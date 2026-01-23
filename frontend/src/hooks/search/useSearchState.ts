import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

export const useSearchState = () => {
  const navigate = useNavigate();
  
  // Use useSearch to get typed search params
  const searchParams = useSearch({ strict: false });
  const urlQuery = searchParams.q || "";

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

    // Use navigate with search updater function
    navigate({ 
      to: "/explore", 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search: (prev: Record<string, any>) => ({
        ...prev,
        q: trimmed || undefined, // undefined removes the param
      })
    });
    
    setSearchState(trimmed);
    isTypingRef.current = false;
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setSearchState("");
    
    // Use navigate with search updater function
    navigate({ 
      to: "/explore", 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search: (prev: Record<string, any>) => ({
        ...prev,
        q: undefined, // Remove the q param
      })
    });
    
    isTypingRef.current = false;
  }, [navigate]);

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