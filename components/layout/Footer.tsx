
import React from 'react';
import { useI18n } from '../../context/I18nContext.tsx';

const Footer: React.FC = () => {
  const { t } = useI18n();
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-400">
        <p>&copy; 2022 u-сloud24. {t('all_rights_reserved')}</p>
      </div>
    </footer>
  );
};

export default Footer;
