import { create } from 'zustand';

export type AuthPromptMode = 'full' | 'protected-only' | 'none';

interface AuthPromptState {
  mode: AuthPromptMode;
  open: boolean;
  // Track if prompt was manually dismissed this session
  dismissedThisSession: boolean;
  setMode: (mode: AuthPromptMode) => void;
  setOpen: (open: boolean) => void;
  setDismissedThisSession: (dismissed: boolean) => void;
  reset: () => void;
}

export const useAuthPromptStore = create<AuthPromptState>((set) => ({
  mode: 'none',
  open: false,
  dismissedThisSession: false,
  setMode: (mode) => set({ mode }),
  setOpen: (open) => set({ open }),
  setDismissedThisSession: (dismissed) => set({ dismissedThisSession: dismissed }),
  reset: () => set({ mode: 'none', open: false, dismissedThisSession: false }),
}));
