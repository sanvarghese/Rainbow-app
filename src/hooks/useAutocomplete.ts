import { useState, useEffect, useCallback, useRef } from 'react';

interface Suggestion {
  id: string;
  name: string;
  category: string;
  image: string;
  url: string;
}

export const useAutocomplete = (debounceDelay: number = 300) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/products/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=8`,
        { signal: abortControllerRef.current.signal }
      );
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Autocomplete fetch error:', error);
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions, debounceDelay]);

  const clearSuggestions = () => {
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);
  };

  return {
    query,
    setQuery,
    suggestions,
    loading,
    showSuggestions,
    setShowSuggestions,
    clearSuggestions,
    handleInputChange,
  };
};