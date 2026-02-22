
import React from 'react';
import { SERVICES } from '../constants.ts';
import ServiceCard from '../components/ui/ServiceCard.tsx';
import Button from '../components/ui/Button.tsx';
import AnimatedElement from '../components/ui/AnimatedElement.tsx';
import { useI18n } from '../context/I18nContext.tsx';

// Define Page type locally or import if it's in a shared types file
type Page = 'home' | 'service' | 'contacts' | 'blog' | 'article';

interface HomePageProps {
  onNavigate: (page: Page, serviceId?: string | null) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="text-center pt-16 pb-8">
        <AnimatedElement>
          <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight">
            {t('hero_title')}
          </h1>
        </AnimatedElement>
        <AnimatedElement delay={200}>
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-slate-300">
            {t('hero_subtitle')}
          </p>
        </AnimatedElement>
        <AnimatedElement delay={400}>
          <div className="mt-10">
            <Button onClick={() => onNavigate('contacts')}> {/* Changed to navigate to contacts */}
              {t('register_cta')}
            </Button>
          </div>
        </AnimatedElement>
      </section>

      {/* Bento Grid Section */}
      <section>
        <AnimatedElement>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-100">{t('bento_title')}</h2>
          <p className="mt-4 text-lg text-slate-400 text-center">{t('bento_subtitle')}</p>
        </AnimatedElement>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => onNavigate('service', service.id)}
              className={index < 2 ? 'lg:col-span-2' : ''}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
