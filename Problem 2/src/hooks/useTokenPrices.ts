import { useCallback, useEffect, useRef, useState } from 'react';
import { PRICE_API_URL } from '../constants';
import type { RawPriceItem, Token } from '../types';
import { normalizeTokenPrices } from '../utils/token';

interface UseTokenPricesResult {
  tokens: Token[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRawPriceItem(value: unknown): value is RawPriceItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.currency === 'string' &&
    typeof value.date === 'string' &&
    typeof value.price === 'number'
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.name !== 'AbortError') {
    return error.message;
  }

  return 'Unable to load token prices. Please try again.';
}

export function useTokenPrices(): UseTokenPricesResult {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(async () => {
    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(PRICE_API_URL, {
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Price request failed with status ${response.status}`);
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Price response was not in the expected format.');
      }

      const normalizedTokens = normalizeTokenPrices(data.filter(isRawPriceItem));

      if (abortController.signal.aborted) {
        return;
      }

      setTokens(normalizedTokens);
      setError(null);
    } catch (fetchError) {
      if (abortController.signal.aborted) {
        return;
      }

      setTokens([]);
      setError(getErrorMessage(fetchError));
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }

      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    void refetch();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [refetch]);

  return {
    tokens,
    isLoading,
    error,
    refetch,
  };
}
