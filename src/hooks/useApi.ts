import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => Promise<any>;

interface UseApiReturn<T> extends UseApiState<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(apiCall: AnyFunction): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data: T = await apiCall(...args);
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Ocorreu um erro inesperado';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
