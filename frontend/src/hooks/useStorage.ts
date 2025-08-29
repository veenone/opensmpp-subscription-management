import { useState, useCallback, useEffect } from 'react';

// Generic storage hook
const useStorage = <T>(
  key: string,
  defaultValue: T,
  storage: Storage
) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from storage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      storage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting storage key "${key}":`, error);
    }
  }, [key, value, storage]);

  const removeValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.warn(`Error removing storage key "${key}":`, error);
    }
  }, [key, defaultValue, storage]);

  return [value, setStoredValue, removeValue] as const;
};

// localStorage hook
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  return useStorage(key, defaultValue, window.localStorage);
};

// sessionStorage hook
export const useSessionStorage = <T>(key: string, defaultValue: T) => {
  return useStorage(key, defaultValue, window.sessionStorage);
};

// Hook for storing and retrieving user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences, clearPreferences] = useLocalStorage('userPreferences', {
    theme: 'system' as 'light' | 'dark' | 'system',
    language: 'en',
    pageSize: 20,
    compactMode: false,
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h' as '12h' | '24h',
    notifications: {
      browser: true,
      email: true,
      sms: false,
    },
  });

  const updatePreference = useCallback(<K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    clearPreferences,
  };
};

// Hook for storing form drafts
export const useFormDraft = <T extends Record<string, any>>(
  formKey: string,
  defaultValues: T,
  autosaveInterval = 30000 // 30 seconds
) => {
  const storageKey = `formDraft_${formKey}`;
  const [draft, setDraft, clearDraft] = useLocalStorage<T>(storageKey, defaultValues);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveDraft = useCallback((values: T) => {
    setDraft(values);
    setLastSaved(new Date());
  }, [setDraft]);

  const hasDraft = useCallback(() => {
    return JSON.stringify(draft) !== JSON.stringify(defaultValues);
  }, [draft, defaultValues]);

  const clearFormDraft = useCallback(() => {
    clearDraft();
    setLastSaved(null);
  }, [clearDraft]);

  // Auto-save functionality
  useEffect(() => {
    if (autosaveInterval > 0) {
      const interval = setInterval(() => {
        if (hasDraft()) {
          setLastSaved(new Date());
        }
      }, autosaveInterval);

      return () => clearInterval(interval);
    }
  }, [autosaveInterval, hasDraft]);

  return {
    draft,
    saveDraft,
    clearDraft: clearFormDraft,
    hasDraft,
    lastSaved,
  };
};
