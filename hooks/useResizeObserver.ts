/**
 * Custom hook for observing element resize with debouncing.
 * Debouncing prevents the D3 simulation from rebuilding on every pixel
 * during a window drag, which would cause lag on slower devices.
 */

import { useState, useEffect, useRef, RefObject } from 'react';

export interface Dimensions {
  width: number;
  height: number;
}

const DEBOUNCE_MS = 150;

export function useResizeObserver(
  containerRef: RefObject<HTMLDivElement | null>
): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;

      const { width, height } = entries[0].contentRect;

      // Debounce: clear any pending update before scheduling a new one
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setDimensions({ width, height });
        timerRef.current = null;
      }, DEBOUNCE_MS);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [containerRef]);

  return dimensions;
}

export default useResizeObserver;
