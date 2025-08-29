import { useEffect, useRef, RefObject } from 'react';

// Hook to detect clicks outside a specific element
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: () => void,
  excludeRefs?: RefObject<HTMLElement>[]
): RefObject<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Check if click is inside any excluded elements
      if (excludeRefs) {
        const isInExcluded = excludeRefs.some(excludeRef => 
          excludeRef.current && excludeRef.current.contains(event.target as Node)
        );
        if (isInExcluded) {
          return;
        }
      }

      handler();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler, excludeRefs]);

  return ref;
};
