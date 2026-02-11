/**
 * Custom hook for observing element resize
 */

import { useState, useEffect, RefObject } from 'react';

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Hook that observes an element and returns its current dimensions
 * Useful for making D3 visualizations responsive
 */
export function useResizeObserver(
  containerRef: RefObject<HTMLDivElement | null>
): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return dimensions;
}

export default useResizeObserver;


