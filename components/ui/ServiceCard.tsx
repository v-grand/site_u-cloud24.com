
import React, { useRef } from 'react';
import { Service } from '../../types.ts';
import { useI18n } from '../../context/I18nContext.tsx';
import useIntersectionObserver from '../../hooks/useIntersectionObserver.ts';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick, className = '' }) => {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement | null>(null);
  const entry = useIntersectionObserver(ref, { threshold: 0.4, freezeOnceVisible: true });
  const isVisible = !!entry?.isIntersecting;

  const Icon = service.icon;

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`
        reveal-card relative p-6 rounded-2xl bg-slate-800/50 backdrop-blur-sm 
        border border-slate-700/80 cursor-pointer group overflow-hidden
        transition-all duration-500 ease-out
        ${className}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
      `}
      style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}
    >
      {/* Border Beam */}
      <div
        className="
          absolute top-0 left-0 w-full h-full
          [--angle:0deg] [--grad-color:theme(colors.cyan.400)]
          bg-[conic-gradient(from_var(--angle)_at_50%_50%,transparent_0%,var(--grad-color)_20%,transparent_25%)]
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
          animate-[rotate_8s_linear_infinite]
        "
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4">
          <Icon className="w-10 h-10 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">{t(service.titleKey)}</h3>
        <p className="text-slate-400 flex-grow">{t(service.descriptionKey)}</p>
        <div className="mt-4 text-cyan-400 font-semibold flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Learn More
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
