
import React from 'react';
import { SERVICES } from '../constants.ts';
import { useI18n } from '../context/I18nContext.tsx';
import AnimatedElement from '../components/ui/AnimatedElement.tsx';

interface ServicePageProps {
  serviceId: string;
}

const ServicePage: React.FC<ServicePageProps> = ({ serviceId }) => {
  const { t } = useI18n();
  const serviceInfo = SERVICES.find(s => s.id === serviceId);

  if (!serviceInfo) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-400">Service not found.</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <AnimatedElement>
        <h1 className="text-4xl md:text-5xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-500">
          {t(serviceInfo.titleKey)}
        </h1>
        <p className="mt-6 text-lg text-slate-300 text-center">
          {t(serviceInfo.descriptionKey)}
        </p>
      </AnimatedElement>

      {/* Removed AI-generated content sections (features, useCase) */}
      {/* If you want to add static features or use cases, you would define them in constants.ts or a separate data file */}
    </div>
  );
};

export default ServicePage;
