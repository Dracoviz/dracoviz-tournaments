import { debounce } from 'lodash';
import { useState, useEffect } from 'react';

// Check if window is defined (so if in the browser or in node.js).
const isBrowser = typeof window !== 'undefined';

export default function useWindowSize() {
  function getSize() {
    return {
      width: isBrowser ? window.innerWidth : 1000,
      height: isBrowser ? window.innerHeight : 1000,
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    // Debounce to avoid the function fire multiple times
    const handleResizeDebounced = debounce(() => {
      setWindowSize(getSize());
    }, 250);

    window.addEventListener('resize', handleResizeDebounced);
    return () => window.removeEventListener('resize', handleResizeDebounced);
  }, []);

  return windowSize;
}
