
import React from 'react';
import { useI18n } from '../../context/I18nContext.tsx';
import { Language } from '../../types.ts';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    let newLang: Language;
    if (language === 'en') {
      newLang = 'ru';
    } else if (language === 'ru') {
      newLang = 'pl';
    } else {
      newLang = 'en';
    }
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="w-14 h-8 flex items-center justify-center bg-slate-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-bold text-slate-300 uppercase"
      aria-label={`Switch to ${language === 'en' ? 'Russian' : language === 'ru' ? 'Polish' : 'English'}`}
    >
      {language}
    </button>
  );
};

export default LanguageSwitcher;
