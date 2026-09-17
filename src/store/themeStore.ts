import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light';

interface ThemeStore {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        set((state) => {
          const next = state.theme === 'dark' ? 'light' : 'dark';
          applyTheme(next);
          return { theme: next };
        });
      },
    }),
    {
      name: 'freds-pos-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme);
        }
      },
    }
  )
);
