import { useRef, useEffect } from 'react';

// Hook to get the previous value of a state or prop
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};
