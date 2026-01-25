import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Update state based on the current match
    const updateMatch = () => {
      setMatches(mediaQuery.matches);
    };
    
    // Set initial value
    updateMatch();
    
    // Listen for changes
    mediaQuery.addEventListener('change', updateMatch);
    
    return () => {
      mediaQuery.removeEventListener('change', updateMatch);
    };
  }, [query]);

  return matches;
}
