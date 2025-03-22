import { useState, useEffect } from 'react';

export function useFormPersistence(formKey, initialState) {
  // Load persisted data on mount
  const loadPersistedData = () => {
    try {
      const savedData = sessionStorage.getItem(formKey);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (err) {
      console.error('Failed to load persisted form data:', err);
    }
    return initialState;
  };

  const [formData, setFormData] = useState(loadPersistedData);

  // Save data on change
  useEffect(() => {
    try {
      sessionStorage.setItem(formKey, JSON.stringify(formData));
    } catch (err) {
      console.error('Failed to persist form data:', err);
    }
  }, [formData, formKey]);

  // Clear data
  const clearPersistedData = () => {
    try {
      sessionStorage.removeItem(formKey);
      setFormData(initialState);
    } catch (err) {
      console.error('Failed to clear persisted form data:', err);
    }
  };

  return [formData, setFormData, clearPersistedData];
} 