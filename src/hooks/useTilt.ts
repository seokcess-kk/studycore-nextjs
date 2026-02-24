'use client';

import { useState, useCallback, MouseEvent, RefObject, CSSProperties } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
}

interface UseTiltOptions {
  max?: number;
  scale?: number;
  speed?: number;
  perspective?: number;
}

interface UseTiltReturn {
  style: CSSProperties;
  handlers: {
    onMouseMove: (e: MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
    onMouseEnter: () => void;
  };
}

export function useTilt(
  ref: RefObject<HTMLElement | null>,
  options: UseTiltOptions = {}
): UseTiltReturn {
  const {
    max = 15,
    scale = 1.02,
    speed = 400,
    perspective = 1000
  } = options;

  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -max;
      const rotateY = ((x - centerX) / centerX) * max;

      setTilt({ rotateX, rotateY, scale });
    },
    [ref, max, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setTilt((prev) => ({ ...prev, scale }));
  }, [scale]);

  const style: CSSProperties = {
    transform: `perspective(${perspective}px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
    transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
  };

  return {
    style,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onMouseEnter: handleMouseEnter,
    },
  };
}
