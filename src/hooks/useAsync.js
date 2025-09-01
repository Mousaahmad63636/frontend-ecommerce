import { useState, useCallback } from 'react';
import { useNotification } from '../components/Notification/NotificationProvider';

export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const execute = useCallback(async (asyncFunction, successMessage) => {
    try {
      setLoading(true);
      setError(null);
      const response = await asyncFunction();
      if (successMessage) {
        showNotification(successMessage, 'success');
      }
      return response;
    } catch (error) {
      setError(error);
      showNotification(error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return { loading, error, execute };
}
