import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";

export const useSearchState = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlQuery = urlParams.get("q") || "";

  const [search, setSearch] = useState(urlQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Sync with URL changes
  useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  const submitSearch = (query: string) => {
    const trimmed = query.trim();
    const newParams = new URLSearchParams(location.search);

    if (trimmed) {
      newParams.set("q", trimmed);
      navigate({ to: "/explore", search: Object.fromEntries(newParams) });
    } else {
      newParams.delete("q");
      navigate({ to: "/explore", search: Object.fromEntries(newParams) });
    }
  };

  const clearSearch = () => {
    setSearch("");
    const newParams = new URLSearchParams(location.search);
    newParams.delete("q");
    navigate({ to: "/explore", search: Object.fromEntries(newParams) });
  };

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