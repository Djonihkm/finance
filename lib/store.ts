import { create } from 'zustand';

interface AppState {
  _placeholder: boolean;
}

export const useStore = create<AppState>(() => ({
  _placeholder: true,
}));
