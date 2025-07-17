import { create } from 'zustand';

export type AuthPromptMode = 'full' | 'protected-only' | 'none';

interface AuthPromptState {
  mode: AuthPromptMode;
  open: boolean;
  setMode: (mode: AuthPromptMode) => void;
  setOpen: (open: boolean) => void;
}

export const useAuthPromptStore = create<AuthPromptState>((set) => ({
  mode: 'none',
  open: false,
  setMode: (mode) => set({ mode }),
  setOpen: (open) => set({ open }),
}));
