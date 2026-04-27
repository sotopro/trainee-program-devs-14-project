import { useCallback, useState } from 'react';

type SetStoredValue<T> = (value: T | ((previousValue: T) => T)) => void;

const canUseLocalStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const readLocalStorageValue = <T>(key: string, defaultValue: T): T => {
  if (!canUseLocalStorage()) {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.warn(`No pudimos leer localStorage para la clave "${key}".`, error);
    return defaultValue;
  }
};

export function useLocalStorage<T>(key: string, defaultValue: T): [T, SetStoredValue<T>] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readLocalStorageValue(key, defaultValue),
  );

  const setValue = useCallback<SetStoredValue<T>>(
    (value) => {
      setStoredValue((previousValue) => {
        const valueToStore = value instanceof Function ? value(previousValue) : value;

        if (!canUseLocalStorage()) {
          return valueToStore;
        }

        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.warn(`No pudimos guardar localStorage para la clave "${key}".`, error);
        }

        return valueToStore;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
