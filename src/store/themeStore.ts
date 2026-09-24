import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleDarkMode: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleDarkMode: () => set((state) => {
        const newDark = !state.isDark;
        if (newDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDark: newDark };
      }),
      initTheme: () => set((state) => {
        if (state.isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return state;
      })
    }),
    {
      name: 'lexiagent-theme',
    }
  )
);
