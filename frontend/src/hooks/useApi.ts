import { useState, useCallback } from 'react';
import { toast } from '../components/common/Toaster';

export interface UseApiState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = <T = unknown>(options: UseApiOptions = {}) => {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({
        data: result,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });

      if (showSuccessToast) {
        toast.success(successMessage);
      }

      onSuccess?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      if (showErrorToast) {
        toast.error(errorMessage);
      }

      onError?.(error);
      throw error;
    }
  }, [showSuccessToast, showErrorToast, successMessage, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null,
    });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      lastUpdated: new Date(),
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
};

// Hook for async operations with loading state
export const useAsyncOperation = (options: UseApiOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }

      onSuccess?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setError(errorMessage);

      if (showErrorToast) {
        toast.error(errorMessage);
      }

      onError?.(error);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [showSuccessToast, showErrorToast, successMessage, onSuccess, onError]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
};

// Hook for paginated data
export const usePaginatedApi = <T = unknown>(initialPageSize = 20) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

  const apiState = useApi<T[]>();

  const loadPage = useCallback(async (
    apiCall: (page: number, size: number, sortBy: string, sortDir: string) => Promise<{ content: T[]; totalElements: number }>
  ) => {
    const result = await apiState.execute(() => apiCall(page, pageSize, sortBy, sortDirection));
    if (result && 'totalElements' in result) {
      setTotalElements(result.totalElements);
    }
    return result;
  }, [apiState.execute, page, pageSize, sortBy, sortDirection]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page
  }, []);

  const handleSort = useCallback((column: string, direction: 'ASC' | 'DESC') => {
    setSortBy(column);
    setSortDirection(direction);
    setPage(0); // Reset to first page
  }, []);

  const reset = useCallback(() => {
    setPage(0);
    setPageSize(initialPageSize);
    setTotalElements(0);
    setSortBy('id');
    setSortDirection('DESC');
    apiState.reset();
  }, [apiState.reset, initialPageSize]);

  return {
    ...apiState,
    page,
    pageSize,
    totalElements,
    sortBy,
    sortDirection,
    loadPage,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    reset,
  };
};
