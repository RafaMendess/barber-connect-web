import { useState, useCallback } from 'react';

type Severity = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  message: string;
  severity: Severity;
  open: boolean;
}

export function useNotification() {
  const [notification, setNotification] = useState<Notification>({
    message: '',
    severity: 'info',
    open: false,
  });

  const notify = useCallback((message: string, severity: Severity = 'info') => {
    setNotification({ message, severity, open: true });
  }, []);

  const success = useCallback(
    (message: string) => notify(message, 'success'),
    [notify]
  );

  const error = useCallback(
    (message: string) => notify(message, 'error'),
    [notify]
  );

  const warning = useCallback(
    (message: string) => notify(message, 'warning'),
    [notify]
  );

  const close = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  return { notification, notify, success, error, warning, close };
}
