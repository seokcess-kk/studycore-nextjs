'use client';

import { useState, useCallback, MouseEvent } from 'react';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  return { ripples, createRipple };
}

interface RippleContainerProps {
  ripples: Ripple[];
  color?: string;
}

export function RippleContainer({ ripples, color = 'currentColor' }: RippleContainerProps) {
  return (
    <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            opacity: 0.35,
          }}
        />
      ))}
    </span>
  );
}
