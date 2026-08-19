import { useEffect, useState } from 'react';

import { getLocationAutoCompleteSuggestions } from '../services/api';
import { useDebouncedValue } from './useDebouncedValue';

export function useLocationAutocomplete(query) {
  const debouncedQuery = useDebouncedValue(query, 300);

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      setIsLoading(true);

      try {
        const suggestions = await getLocationAutoCompleteSuggestions(
          debouncedQuery,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setResults(suggestions);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching location suggestions:', error);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  return {
    results,
    isLoading,
  };
}
