import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  className?: string;
  distance?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.7,
  className = '',
  distance = 28,
}) => {
  const elRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setHasAnimated(true);
      return;
    }

    // Determine initial transform offset
    let initialX = 0;
    let initialY = 0;
    if (direction === 'up') initialY = distance;
    if (direction === 'down') initialY = -distance;
    if (direction === 'left') initialX = distance;
    if (direction === 'right') initialX = -distance;

    gsap.set(el, {
      opacity: 0,
      x: initialX,
      y: initialY,
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            gsap.to(el, {
              opacity: 1,
              x: 0,
              y: 0,
              duration,
              delay,
              ease: 'power3.out',
              clearProps: 'transform',
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [delay, direction, duration, distance, hasAnimated]);

  return (
    <div ref={elRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
};
