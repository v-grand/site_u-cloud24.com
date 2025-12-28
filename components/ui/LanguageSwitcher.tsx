
import React from 'react';
import { useI18n } from '../../context/I18nContext.tsx';
import { Language } from '../../types.ts';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'ru' : 'en';
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="relative w-14 h-8 flex items-center bg-slate-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      aria-label={`Switch to ${language === 'en' ? 'Russian' : 'English'}`}
    >
      <span className="absolute left-2 text-xs font-bold text-slate-300">EN</span>
      <span className="absolute right-2 text-xs font-bold text-slate-300">RU</span>
      <div
        className={`absolute bg-cyan-400 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
          language === 'en' ? 'translate-x-0' : 'translate-x-6'
        }`}
      />
    </button>
  );
};

export default LanguageSwitcher;
