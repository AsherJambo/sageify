import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  title: string;
  organization: string;
  category: 'work' | 'volunteer' | 'course' | 'freelance';
  description: string;
  link: string;
  location: string;
  whyFits: string;
}

export interface SearchState {
  isSearching: boolean;
  results: SearchResult[];
  query: string;
}

export function useLiveSearch(profileContext: string) {
  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    results: [],
    query: '',
  });

  const executeSearch = useCallback(async (query: string): Promise<SearchResult[]> => {
    setSearchState({ isSearching: true, results: [], query });

    try {
      const { data, error } = await supabase.functions.invoke('perplexity-search', {
        body: { query, profileContext },
      });

      if (error) throw new Error(error.message);

      const results = data?.results || [];
      setSearchState({ isSearching: false, results, query });
      return results;
    } catch (e) {
      console.error('Live search error:', e);
      setSearchState({ isSearching: false, results: [], query });
      return [];
    }
  }, [profileContext]);

  const extractSearchQueries = useCallback((text: string): string[] => {
    const regex = /\[SEARCH_QUERY:\s*(.+?)\]/g;
    const queries: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      queries.push(match[1].trim());
    }
    return queries;
  }, []);

  const cleanSearchTags = useCallback((text: string): string => {
    return text.replace(/\[SEARCH_QUERY:\s*.+?\]/g, '').trim();
  }, []);

  return { searchState, executeSearch, extractSearchQueries, cleanSearchTags };
}
