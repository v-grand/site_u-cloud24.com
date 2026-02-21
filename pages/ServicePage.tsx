
import React from 'react';
import { SERVICES } from '../constants.ts';
import { useI18n } from '../context/I18nContext.tsx';
import AnimatedElement from '../components/ui/AnimatedElement.tsx';
import Button from '../components/ui/Button.tsx';

interface ServicePageProps {
  serviceId: string;
  onNavigate?: (page: 'home' | 'service' | 'contacts', serviceId?: string | null) => void;
}

const ServicePage: React.FC<ServicePageProps> = ({ serviceId, onNavigate }) => {
  const { t } = useI18n();
  const serviceInfo = SERVICES.find(s => s.id === serviceId);

  if (!serviceInfo) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-400">Service not found.</h2>
      </div>
    );
  }

  const Icon = serviceInfo.icon;
  const detailedKey = `service_${serviceInfo.id}_detailed`;
  const featuresKey = `service_${serviceInfo.id}_features`;
  const usecaseKey = `service_${serviceInfo.id}_usecase`;

  return (
    <div className="space-y-16 md:space-y-24 py-8">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center">
        <AnimatedElement>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-cyan-400/20 to-orange-500/20 rounded-xl border border-cyan-400/30">
              <Icon className="w-16 h-16 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-500">
            {t(serviceInfo.titleKey)}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            {t(serviceInfo.descriptionKey)}
          </p>
        </AnimatedElement>
      </section>

      {/* Detailed Description */}
      <section className="max-w-4xl mx-auto">
        <AnimatedElement delay={100}>
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 md:p-12 backdrop-blur-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-6">
              Why Choose Our {t(serviceInfo.titleKey)}?
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              {t(detailedKey)}
            </p>
          </div>
        </AnimatedElement>
      </section>

      {/* Key Features */}
      <section className="max-w-4xl mx-auto">
        <AnimatedElement delay={200}>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-8">
            {t('key_features')}
          </h2>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t(featuresKey)
            .split(' | ')
            .map((feature, index) => (
              <AnimatedElement key={index} delay={300 + index * 50}>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:border-cyan-400/50 transition-colors duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20">
                        <svg
                          className="h-4 w-4 text-cyan-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium">{feature.trim()}</p>
                    </div>
                  </div>
                </div>
              </AnimatedElement>
            ))}
        </div>
      </section>

      {/* Real-World Use Case */}
      <section className="max-w-4xl mx-auto">
        <AnimatedElement delay={400}>
          <div className="bg-gradient-to-r from-cyan-500/10 to-orange-500/10 border border-cyan-400/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-6">
              {t('real_world_use_case')}
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              {t(usecaseKey)}
            </p>
          </div>
        </AnimatedElement>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto text-center">
        <AnimatedElement delay={500}>
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
              Ready to get started?
            </h3>
            <p className="text-lg text-slate-300 mb-8">
              Let's discuss how we can help you implement this solution for your business.
            </p>
            <Button onClick={() => onNavigate?.('contacts')}>
              {t('register_cta')}
            </Button>
          </div>
        </AnimatedElement>
      </section>
    </div>
  );
};

export default ServicePage;
