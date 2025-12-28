
import React, { useRef } from 'react';
import useIntersectionObserver from '../../hooks/useIntersectionObserver.ts';

interface AnimatedElementProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // in ms
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const entry = useIntersectionObserver(ref, { threshold: 0.2, freezeOnceVisible: true });
  const isVisible = !!entry?.isIntersecting;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${isVisible ? delay : 0}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedElement;
