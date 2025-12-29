
import React from 'react';
import { useI18n } from '../../context/I18nContext.tsx';
import { Language } from '../../types.ts';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useI18n();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as Language);
  };

  return (
    <div className="relative">
      <select
        value={language}
        onChange={handleLanguageChange}
        className="w-14 h-8 pl-2 pr-4 text-sm font-bold uppercase bg-slate-700 text-slate-300 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400"
        aria-label="Select language"
      >
        <option value="en">EN</option>
        <option value="pl">PL</option>
        <option value="ru">RU</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
