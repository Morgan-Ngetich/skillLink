import type { MentorSessionPublic, MentorServicePublic, MentorExplorePublic } from "@/client";

export type SearchResultType = "mentor" | "session" | "service";

export interface UnifiedSearchResult {
  type: SearchResultType;
  data: MentorExplorePublic | MentorSessionPublic | MentorServicePublic;
  score: number;
}

export interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  search: string;
  setSearch: (value: string) => void;
  isFocused?: boolean;
  setIsFocused?: (value: boolean) => void;
  setDropdownVisible?: (value: boolean) => void;
  onSubmit: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export interface SearchDropdownProps {
  search: string;
  unifiedResults: UnifiedSearchResult[];
  isLoading: boolean;
  history: string[];
  onSubmit: (query: string) => void;
  onClearHistory: () => void;
}

export interface SearchResultItemProps {
  result: UnifiedSearchResult;
  onClick: (result: UnifiedSearchResult) => void;
}