
import React from 'react';
import useGeminiContent from '../hooks/useGeminiContent.ts';
import { SERVICES } from '../constants.ts';
import { useI18n } from '../context/I18nContext.tsx';
import AnimatedElement from '../components/ui/AnimatedElement.tsx';

interface ServicePageProps {
  serviceId: string;
}

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse space-y-12">
    <div className="h-10 bg-slate-700 rounded w-3/4 mx-auto"></div>
    <div className="space-y-3">
      <div className="h-4 bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
    </div>
    <div className="h-8 bg-slate-700 rounded w-1/3 mt-10"></div>
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-slate-800 p-6 rounded-lg space-y-3">
        <div className="h-6 bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
      </div>
      <div className="bg-slate-800 p-6 rounded-lg space-y-3">
        <div className="h-6 bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
      </div>
      <div className="bg-slate-800 p-6 rounded-lg space-y-3">
        <div className="h-6 bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

const ServicePage: React.FC<ServicePageProps> = ({ serviceId }) => {
  const { t } = useI18n();
  const serviceInfo = SERVICES.find(s => s.id === serviceId);
  const serviceTitle = serviceInfo ? t(serviceInfo.titleKey) : '';
  const { content, loading, error } = useGeminiContent(serviceId, serviceTitle);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error || !content) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-400">{t('error_content')}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <AnimatedElement>
        <h1 className="text-4xl md:text-5xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-500">
          {content.title}
        </h1>
        <p className="mt-6 text-lg text-slate-300 text-center">
          {content.detailedDescription}
        </p>
      </AnimatedElement>

      <AnimatedElement delay={200}>
        <h2 className="text-3xl font-bold mt-16 mb-6 text-slate-100">{t('key_features')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {content.features.map((feature, index) => (
            <div key={index} className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-cyan-400 mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </AnimatedElement>

      <AnimatedElement delay={400}>
        <h2 className="text-3xl font-bold mt-16 mb-6 text-slate-100">{t('real_world_use_case')}</h2>
        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-xl">
          <p className="text-slate-300 leading-relaxed">{content.useCase}</p>
        </div>
      </AnimatedElement>
    </div>
  );
};

export default ServicePage;
