
import React from 'react';
import AnimatedElement from '../components/ui/AnimatedElement.tsx';
import { useI18n } from '../context/I18nContext.tsx';

const ContactsPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen-content py-12 px-4 sm:px-6 lg:px-8">
      <AnimatedElement>
        <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tight text-center">
          {t('contacts_title')}
        </h1>
      </AnimatedElement>
      <AnimatedElement delay={200}>
        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-slate-300 text-center">
          {t('contacts_description')}
        </p>
      </AnimatedElement>
      <AnimatedElement delay={400}>
        <div className="mt-10 text-center">
          <p className="text-2xl text-slate-100">
            {t('email_label')}: <a href="mailto:info@u-cloud24.com" className="text-blue-400 hover:underline">info@u-cloud24.com</a>
          </p>
        </div>
      </AnimatedElement>
    </div>
  );
};

export default ContactsPage;
