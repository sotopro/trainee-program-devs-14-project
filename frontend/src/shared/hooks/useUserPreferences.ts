import { useLocalStorage } from './useLocalStorage';

export type ThemePreference = 'light' | 'dark' | 'system';
export type CourseViewPreference = 'grid' | 'list';

export type UserPreferences = {
  theme: ThemePreference;
  isSidebarOpen: boolean;
  courseView: CourseViewPreference;
};

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  isSidebarOpen: true,
  courseView: 'grid',
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'learnpath-preferences',
    DEFAULT_USER_PREFERENCES,
  );

  return {
    preferences,
    setPreferences,
    setTheme: (theme: ThemePreference) =>
      setPreferences((current) => ({
        ...current,
        theme,
      })),
    setSidebarOpen: (isSidebarOpen: boolean) =>
      setPreferences((current) => ({
        ...current,
        isSidebarOpen,
      })),
    setCourseView: (courseView: CourseViewPreference) =>
      setPreferences((current) => ({
        ...current,
        courseView,
      })),
  };
}
